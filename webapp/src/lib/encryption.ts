import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 64 hex characters (32 bytes = 256 bits)
const IV_LENGTH = 16; // For AES, this is always 16

// Validate encryption key on module load
if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
}
if (!/^[0-9a-fA-F]{64}$/.test(ENCRYPTION_KEY)) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
}

const ENCRYPTION_KEY_BUFFER = Buffer.from(ENCRYPTION_KEY, "hex");

export function encrypt(text: string): string {
    if (!text) {
        throw new Error("Text to encrypt cannot be empty");
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY_BUFFER, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string): string {
    try {
        // Validation: Encrypted text must contain a colon separator
        if (!text || !text.includes(":")) {
            throw new Error("Invalid encrypted text format: missing colon separator");
        }

        const textParts = text.split(":");
        const ivHex = textParts.shift() || "";
        const encryptedTextHex = textParts.join(":");

        // Validation: IV must be a valid hex string and decode to IV_LENGTH bytes
        const iv = Buffer.from(ivHex, "hex");
        if (iv.length !== IV_LENGTH) {
            throw new Error(`Invalid IV length: expected ${IV_LENGTH} bytes, got ${iv.length}`);
        }

        // Validation: Check for valid hex in encrypted text
        if (!/^[0-9a-fA-F]*$/.test(encryptedTextHex)) {
            throw new Error("Invalid encrypted text: not a valid hex string");
        }

        const encryptedText = Buffer.from(encryptedTextHex, "hex");
        const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY_BUFFER, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Failed to decrypt data");
    }
}
