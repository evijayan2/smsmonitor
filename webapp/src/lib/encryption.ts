import crypto from "crypto";
import { logger } from "./logger";

const IV_LENGTH = 16; // AES block size in bytes (always 16 bytes = 32 hex chars)

/**
 * Retrieves the encryption key buffer, validating format or falling back in test mode.
 *
 * @returns Buffer containing the 32-byte encryption key
 */
function getEncryptionKeyBuffer(): Buffer {
  const envKey =
    process.env.ENCRYPTION_KEY ||
    (process.env.NODE_ENV === "test"
      ? "f3b2c1d0e9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2"
      : "");

  if (!envKey) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }
  if (!/^[0-9a-fA-F]{64}$/.test(envKey)) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }

  return Buffer.from(envKey, "hex");
}

/**
 * Checks whether a text string matches the encrypted payload format.
 *
 * @param text - String to check
 * @returns True if text has a 32-character hex IV followed by colon and hex ciphertext
 */
export function isEncrypted(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const colonIndex = text.indexOf(":");
  if (colonIndex !== 32) return false;
  const ivHex = text.slice(0, 32);
  const cipherHex = text.slice(33);
  if (!cipherHex) return false;
  return /^[0-9a-fA-F]{32}$/.test(ivHex) && /^[0-9a-fA-F]+$/.test(cipherHex);
}

/**
 * Encrypts a plaintext string using AES-256-CBC.
 *
 * @param text - Plaintext string to encrypt
 * @returns Encrypted string in the format iv:ciphertext
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error("Text to encrypt cannot be empty");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", getEncryptionKeyBuffer(), iv);
  let encrypted = cipher.update(text, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts an AES-256-CBC encrypted string in format iv:ciphertext.
 *
 * @param text - The encrypted string to decrypt
 * @returns The decrypted UTF-8 plaintext
 */
export function decrypt(text: string): string {
  if (!text || !text.includes(":")) {
    throw new Error("Invalid encrypted text format: missing colon separator");
  }

  const textParts = text.split(":");
  const ivHex = textParts.shift() || "";
  const encryptedTextHex = textParts.join(":");

  const iv = Buffer.from(ivHex, "hex");
  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length: expected ${IV_LENGTH} bytes, got ${iv.length}`);
  }

  if (!/^[0-9a-fA-F]*$/.test(encryptedTextHex)) {
    throw new Error("Invalid encrypted text: not a valid hex string");
  }

  const encryptedText = Buffer.from(encryptedTextHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", getEncryptionKeyBuffer(), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * Safely decrypts a string, returning the original text if it is not encrypted
 * or if decryption fails.
 *
 * @param text - The string to decrypt or return as fallback
 * @returns The decrypted string or original text
 */
export function safeDecrypt(text: string): string {
  if (!text) return "";
  if (!isEncrypted(text)) {
    return text;
  }
  try {
    return decrypt(text);
  } catch (error) {
    logger.warn("Failed to decrypt field, using raw fallback", { error: String(error) });
    return text;
  }
}
