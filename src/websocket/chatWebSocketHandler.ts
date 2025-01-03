import { Server, Socket } from "socket.io";

export function setupChatWebSocket(io: Server) {
  console.log("Configurando WebSocket de bate-papo...");

  io.on("connection", (socket: Socket) => {
    console.log("Cliente conectado");

    socket.on("disconnect", () => {
      console.log("Cliente desconectado");
    });
  });
}
