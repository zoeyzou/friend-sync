import crypto from "node:crypto";
import { env } from "~/env";
import { PrismaClient } from "../../generated/prisma";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TOKEN_FIELDS = ["refresh_token", "access_token", "id_token"] as const;

function getEncryptionKey(): Buffer {
  const key = process.env.ACCOUNT_TOKEN_ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "ACCOUNT_TOKEN_ENCRYPTION_KEY must be set to enable Account token encryption",
    );
  }
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

function encryptAccountData(data: Record<string, unknown> | undefined) {
  if (!data) return;
  for (const field of TOKEN_FIELDS) {
    const raw = data[field];
    if (typeof raw === "string" || raw == null) {
      data[field] = encrypt(raw as string | null | undefined) as unknown;
    }
  }
}

function decryptAccountRecord(record: Record<string, unknown> | null) {
  if (!record) return;
  for (const field of TOKEN_FIELDS) {
    const raw = record[field];
    if (typeof raw === "string" || raw == null) {
      record[field] = decrypt(raw as string | null | undefined) as unknown;
    }
  }
}

const createPrismaClient = () => {
  const client = new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

  // Wrap the Account delegate to transparently encrypt/decrypt token fields.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const baseAccount: any = (client as any).account;

  const wrappedAccount = {
    ...baseAccount,
    async create(args: any) {
      const nextArgs = { ...args, data: { ...args.data } };
      encryptAccountData(nextArgs.data);
      const res = await baseAccount.create(nextArgs);
      decryptAccountRecord(res);
      return res;
    },
    async createMany(args: any) {
      if (Array.isArray(args?.data)) {
        const nextArgs = {
          ...args,
          data: args.data.map((d: any) => ({ ...d })),
        };
        for (const item of nextArgs.data) encryptAccountData(item);
        return baseAccount.createMany(nextArgs);
      }
      const nextArgs = { ...args, data: { ...args.data } };
      encryptAccountData(nextArgs.data);
      return baseAccount.createMany(nextArgs);
    },
    async update(args: any) {
      const nextArgs = { ...args, data: { ...args.data } };
      encryptAccountData(nextArgs.data);
      const res = await baseAccount.update(nextArgs);
      decryptAccountRecord(res);
      return res;
    },
    async updateMany(args: any) {
      const nextArgs = { ...args, data: { ...args.data } };
      encryptAccountData(nextArgs.data);
      return baseAccount.updateMany(nextArgs);
    },
    async upsert(args: any) {
      const nextArgs = {
        ...args,
        create: { ...args.create },
        update: { ...args.update },
      };
      encryptAccountData(nextArgs.create);
      encryptAccountData(nextArgs.update);
      const res = await baseAccount.upsert(nextArgs);
      decryptAccountRecord(res);
      return res;
    },
    async findUnique(args: any) {
      const res = await baseAccount.findUnique(args);
      if (res) decryptAccountRecord(res);
      return res;
    },
    async findFirst(args: any) {
      const res = await baseAccount.findFirst(args);
      if (res) decryptAccountRecord(res);
      return res;
    },
    async findMany(args: any) {
      const res = await baseAccount.findMany(args);
      if (Array.isArray(res)) {
        for (const row of res) decryptAccountRecord(row);
      }
      return res;
    },
    async delete(args: any) {
      return baseAccount.delete(args);
    },
    async deleteMany(args: any) {
      return baseAccount.deleteMany(args);
    },
    async aggregate(args: any) {
      return baseAccount.aggregate(args);
    },
    async groupBy(args: any) {
      return baseAccount.groupBy(args);
    },
    count(args: any) {
      return baseAccount.count(args);
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  (client as any).account = wrappedAccount;

  return client;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
