import { beforeEach, describe, expect, it } from "vitest";
import {
  decryptAccountRecord,
  decryptToken,
  encryptAccountData,
  encryptToken,
} from "./account-encryption";

function setTestKey(seed: string) {
  // Simple deterministic 32-byte buffer from a seed string for tests
  const buf = Buffer.alloc(32);
  buf.write(seed.slice(0, 32));
  process.env.ACCOUNT_TOKEN_ENCRYPTION_KEY = buf.toString("base64");
}

describe("account-encryption", () => {
  beforeEach(() => {
    setTestKey("test-key-for-encryption!!!!!!!!");
  });

  it("performs encrypt/decrypt roundtrip successfully", () => {
    const plaintext = "super-secret-token";
    const encrypted = encryptToken(plaintext);
    expect(encrypted).toBeTruthy();
    expect(encrypted).not.toEqual(plaintext);
    const decrypted = decryptToken(encrypted as string);
    expect(decrypted).toEqual(plaintext);
  });

  it("throws when decrypting with the wrong key", () => {
    const plaintext = "another-secret";
    const encrypted = encryptToken(plaintext) as string;

    setTestKey("different-key-for-decryption!!!");

    expect(() => decryptToken(encrypted)).toThrowError(
      "Failed to decrypt Account token",
    );
  });

  it("throws when decrypting corrupted data", () => {
    const plaintext = "corrupt-me";
    const encrypted = encryptToken(plaintext) as string;
    const corrupted = encrypted.slice(0, -4); // truncate so tag/ciphertext is invalid

    expect(() => decryptToken(corrupted)).toThrowError(
      "Failed to decrypt Account token",
    );
  });

  it("handles bulk encrypt/decrypt for createMany/findMany-style data", () => {
    const items = [
      { refresh_token: "r1", access_token: "a1", id_token: "i1" },
      { refresh_token: "r2", access_token: null, id_token: undefined },
    ];

    const encryptedItems: Record<string, unknown>[] = items.map(
      (item) =>
        encryptAccountData(item as Record<string, unknown>) as Record<
          string,
          unknown
        >,
    );

    // Original items are unchanged (no mutation)
    const first = items[0];
    const second = items[1];
    if (!first || !second) {
      throw new Error("Expected two items in test data");
    }
    expect(first.refresh_token).toBe("r1");
    expect(second.access_token).toBeNull();

    const decryptedItems = encryptedItems.map((item) =>
      decryptAccountRecord(item as Record<string, unknown>),
    );

    expect(decryptedItems).toEqual(items);
  });

  it("treats null/undefined values as pass-through", () => {
    expect(encryptToken(null)).toBeNull();
    expect(encryptToken(undefined)).toBeUndefined();
    expect(decryptToken(null)).toBeNull();
    expect(decryptToken(undefined)).toBeUndefined();

    const record = {
      refresh_token: null as string | null,
      access_token: undefined as string | undefined,
      id_token: "value",
    };

    const encrypted = encryptAccountData(record);
    expect(encrypted.refresh_token).toBeNull();
    expect(encrypted.access_token).toBeUndefined();
    expect(typeof encrypted.id_token).toBe("string");

    const decrypted = decryptAccountRecord(encrypted);
    expect(decrypted.refresh_token).toBeNull();
    expect(decrypted.access_token).toBeUndefined();
    expect(decrypted.id_token).toBe("value");
  });
});
