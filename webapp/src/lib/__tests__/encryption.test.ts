import { describe, it, expect } from "vitest";
import {
  encrypt,
  decrypt,
  isEncrypted,
  safeDecrypt,
} from "../encryption";

describe("encryption module", () => {
  it("should encrypt and decrypt string accurately", () => {
    const original = "Hello World! Verification code: 123456";
    const encrypted = encrypt(original);

    expect(isEncrypted(encrypted)).toBe(true);
    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain(":");

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it("should detect non-encrypted strings correctly", () => {
    expect(isEncrypted("plain text")).toBe(false);
    expect(isEncrypted("invalid:colon:format")).toBe(false);
    expect(isEncrypted("short:1234")).toBe(false);
    expect(isEncrypted("")).toBe(false);
    expect(isEncrypted(null as unknown as string)).toBe(false);
  });

  it("safeDecrypt should decrypt valid encrypted text", () => {
    const text = "Safe decrypted test message";
    const encrypted = encrypt(text);
    expect(safeDecrypt(encrypted)).toBe(text);
  });

  it("safeDecrypt should return original plaintext without throwing if unencrypted", () => {
    const rawPlaintext = "Legacy plain text message without colon";
    expect(safeDecrypt(rawPlaintext)).toBe(rawPlaintext);
  });

  it("safeDecrypt should return original text if format has colon but invalid hex", () => {
    const textWithColon = "Prefix: not an encrypted payload";
    expect(safeDecrypt(textWithColon)).toBe(textWithColon);
  });

  it("safeDecrypt should return empty string for empty input", () => {
    expect(safeDecrypt("")).toBe("");
  });

  it("encrypt throws error if input text is empty", () => {
    expect(() => encrypt("")).toThrow("Text to encrypt cannot be empty");
  });

  it("decrypt throws error if format has no colon", () => {
    expect(() => decrypt("invalid")).toThrow("missing colon separator");
  });
});

