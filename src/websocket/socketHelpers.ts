// utils/socketHelpers.ts
import { Socket } from "socket.io";

export function handleError(socket: Socket, error: Error, source: string) {
    console.error(`Erro no ${source}:`, error);
    socket.emit("error", { message: "Algo deu errado, tente novamente." });
  }
  
  export function validateFields(data: any, requiredFields: string[]): boolean {
    return requiredFields.every((field) => data.hasOwnProperty(field) && data[field] !== null);
  }