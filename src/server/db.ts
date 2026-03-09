import crypto from "node:crypto";
import { env } from "~/env";
import { PrismaClient } from "../../generated/prisma";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getEncryptionKey(): Buffer | null {
  const key = process.env.ACCOUNT_TOKEN_ENCRYPTION_KEY;
  if (!key) return null;
  const buf = Buffer.from(key, "base64");
  if (buf.length !== 32) {
    throw new Error(
      "ACCOUNT_TOKEN_ENCRYPTION_KEY must be a 32-byte key, base64 encoded",
    );
  }
  return buf;
}

function encrypt(value: string | null | undefined): string | null | undefined {
  if (!value) return value;
  const key = getEncryptionKey();
  if (!key) return value;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

function decrypt(value: string | null | undefined): string | null | undefined {
  if (!value) return value;
  const key = getEncryptionKey();
  if (!key) return value;
  const buf = Buffer.from(value, "base64");
  if (buf.length < IV_LENGTH + 16) return value;
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + 16);
  const ciphertext = buf.subarray(IV_LENGTH + 16);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

const createPrismaClient = () => {
  const client: PrismaClient = new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  // Middleware to encrypt/decrypt sensitive Account tokens at rest
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
  (client as any).$use(
    async (params: any, next: (params: any) => Promise<any>) => {
      if (params.model === "Account") {
        if (
          ["create", "createMany", "update", "updateMany", "upsert"].includes(
            params.action,
          )
        ) {
          const fields = ["refresh_token", "access_token", "id_token"] as const;
          const applyEncryption = (
            data: Record<string, unknown> | undefined,
          ) => {
            if (!data) return;
            for (const field of fields) {
              const raw = data[field];
              if (typeof raw === "string" || raw == null) {
                data[field] = encrypt(
                  raw as string | null | undefined,
                ) as unknown;
              }
            }
          };

          if ("data" in params.args) {
            if (Array.isArray(params.args.data)) {
              for (const item of params.args.data) applyEncryption(item);
            } else {
              applyEncryption(params.args.data);
            }
          }
        }
      }

      const result = await next(params);

      if (params.model === "Account") {
        const fields = ["refresh_token", "access_token", "id_token"] as const;
        const applyDecryption = (record: Record<string, unknown> | null) => {
          if (!record) return;
          for (const field of fields) {
            const raw = record[field];
            if (typeof raw === "string" || raw == null) {
              record[field] = decrypt(
                raw as string | null | undefined,
              ) as unknown;
            }
          }
        };

        if (Array.isArray(result)) {
          for (const row of result) applyDecryption(row);
        } else if (result && typeof result === "object") {
          applyDecryption(result as Record<string, unknown>);
        }
      }

      return result;
    },
  );

  return client;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
