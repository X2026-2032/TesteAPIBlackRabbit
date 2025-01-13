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


{/*
   import { publicEncrypt, privateDecrypt } from "crypto";

function encryptMessage(publicKey: string, message: string): string {
  return publicEncrypt(publicKey, Buffer.from(message)).toString("base64");
}

function decryptMessage(privateKey: string, encryptedMessage: string): string {
  return privateDecrypt(privateKey, Buffer.from(encryptedMessage, "base64")).toString("utf-8");
} 
    */}