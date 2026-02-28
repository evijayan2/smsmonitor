import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ""; // Must be 32 characters (256 bits)
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
        throw new Error("ENCRYPTION_KEY must be at least 32 characters long");
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string): string {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
        throw new Error("ENCRYPTION_KEY must be at least 32 characters long");
    }

    try {
        // Validation: Encrypted text must contain a colon separator
        if (!text || !text.includes(":")) {
            return text;
        }

        const textParts = text.split(":");
        const ivHex = textParts.shift() || "";
        const encryptedTextHex = textParts.join(":");

        // Validation: IV must be a valid hex string and decode to IV_LENGTH bytes
        const iv = Buffer.from(ivHex, "hex");
        if (iv.length !== IV_LENGTH) {
            return text;
        }

        const encryptedText = Buffer.from(encryptedTextHex, "hex");
        const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption failed:", error);
        return text; // Return original text if decryption fails
    }
}
