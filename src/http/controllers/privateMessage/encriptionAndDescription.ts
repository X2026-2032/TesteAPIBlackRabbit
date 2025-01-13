import crypto from "crypto";

// Criptografa uma mensagem
export function encryptMessage(content: string, publicKey: string): string {
  const buffer = Buffer.from(content, "utf-8");
  const encrypted = crypto.publicEncrypt(publicKey, buffer);
  return encrypted.toString("base64");
}

// Descriptografa uma mensagem
export function decryptMessage(encryptedContent: string, privateKey: string): string {
  const buffer = Buffer.from(encryptedContent, "base64");
  const decrypted = crypto.privateDecrypt(privateKey, buffer);
  return decrypted.toString("utf-8");
}

