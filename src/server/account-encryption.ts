import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
/**
 * Prefix used to mark values that have been encrypted by this module.
 *
 * Security model:
 * - Values starting with `enc:` are treated as ciphertext produced by `encryptToken`
 *   and MUST decrypt successfully with the current key, otherwise an error is thrown.
 * - Values without this prefix are treated as legacy/plaintext and are returned as-is.
 *
 * NOTE: There is no supported “legacy encrypted without prefix” format in this app.
 * Any token that was stored before encryption was added is plain text, and any token
 * that should be encrypted MUST be written with this prefix going forward.
 */
const ENCRYPTION_PREFIX = "enc:";

export const TOKEN_FIELDS = [
  "refresh_token",
  "access_token",
  "id_token",
] as const;

export type TokenField = (typeof TOKEN_FIELDS)[number];

export function getEncryptionKey(): Buffer {
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

export function encryptToken(
  value: string | null | undefined,
): string | null | undefined {
  if (value == null) return value;
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, tag, ciphertext]).toString("base64");
  return `${ENCRYPTION_PREFIX}${payload}`;
}

export function decryptToken(
  value: string | null | undefined,
): string | null | undefined {
  if (value == null) return value;
  // Legacy/plaintext values (no prefix) are returned as-is and never decrypted.
  if (!value.startsWith(ENCRYPTION_PREFIX)) return value;
  try {
    const key = getEncryptionKey();
    const encoded = value.slice(ENCRYPTION_PREFIX.length);
    const buf = Buffer.from(encoded, "base64");
    if (buf.length < IV_LENGTH + 16) {
      throw new Error("Ciphertext too short");
    }
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
  } catch (error) {
    console.error("Failed to decrypt Account token", error);
    throw new Error("Failed to decrypt Account token");
  }
}

export function encryptAccountData<
  T extends Record<string, unknown> | null | undefined,
>(data: T): T {
  if (!data) return data;
  const copy: Record<string, unknown> = {
    ...(data as Record<string, unknown>),
  };
  for (const field of TOKEN_FIELDS) {
    const raw = copy[field];
    if (typeof raw === "string" || raw == null) {
      copy[field] = encryptToken(raw as string | null | undefined) as unknown;
    }
  }
  return copy as T;
}

export function decryptAccountRecord<
  T extends Record<string, unknown> | null | undefined,
>(record: T): T {
  if (!record) return record;
  const copy: Record<string, unknown> = {
    ...(record as Record<string, unknown>),
  };
  for (const field of TOKEN_FIELDS) {
    const raw = copy[field];
    if (raw == null) continue;
    if (typeof raw === "string") {
      try {
        const decrypted = decryptToken(raw);
        // If decryption fails, decryptToken throws and we never reach here.
        // If it succeeds but returns the same string (e.g. legacy/plain), keep it.
        if (decrypted !== raw) {
          copy[field] = decrypted as unknown;
        }
      } catch (error) {
        // Log and rethrow so that corrupted encrypted tokens are never silently accepted.
        // eslint-disable-next-line no-console
        console.error(
          `[AccountEncryption] Failed to decrypt field ${field}`,
          error,
        );
        throw error;
      }
    }
  }
  return copy as T;
}
