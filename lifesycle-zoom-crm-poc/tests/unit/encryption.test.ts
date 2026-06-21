import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "../../packages/crm-mock/src/lib/encryption.js";

const TEST_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("encryption", () => {
  it("round-trips start_url encryption", () => {
    const plaintext = "https://zoom.us/s/12345?zak=secret-host-token";
    const ciphertext = encrypt(plaintext, TEST_KEY);
    expect(ciphertext).not.toContain("secret-host-token");
    expect(decrypt(ciphertext, TEST_KEY)).toBe(plaintext);
  });

  it("rejects invalid key length", () => {
    expect(() => encrypt("test", "tooshort")).toThrow("ENCRYPTION_KEY");
  });
});
