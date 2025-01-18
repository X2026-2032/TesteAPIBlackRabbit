import { Server, Socket } from "socket.io";
import { prisma } from "@/lib/prisma";
import { encryptMessage, decryptMessage } from "@/http/controllers/privateMessage/encriptionAndDescription";

export function setupChatWebSocket(io: Server) {
  console.log("Configurando WebSocket de bate-papo...");

  // A cada nova conexão, é possível manter uma lista de conexões ativas
  io.on("connection", (socket: Socket) => {
    console.log("Cliente conectado", socket.id);

    // Ao se conectar, registre o ID do usuário (por exemplo, para autenticação)
    socket.on("register", (userId: string) => {
      // Armazene a conexão com o ID do usuário
      socket.join(userId); // A cada usuário será atribuído um 'room' com seu ID
      console.log(`${userId} conectado com o socket id ${socket.id}`);
    });

    // Enviando mensagens para outros usuários
    socket.on("send_message", async (data) => {
      const { senderId, receiverId, content } = data;

      try {
        // Obtendo os dados dos usuários
        const sender = await prisma.graphicAccount.findUnique({ where: { id: senderId } });
        const receiver = await prisma.graphicAccount.findUnique({ where: { id: receiverId } });

        if (!sender || !receiver) {
          console.log("Usuário não encontrado");
          return;
        }

        // Criptografando a mensagem
        const encryptedMessage = encryptMessage(content, receiver.publicKey as string);

        // Salvando a mensagem no banco de dados
        await prisma.privateMessage.create({
          data: { senderId, receiverId, content: encryptedMessage, type: "private" },
        });

        // Enviando a mensagem criptografada para o destinatário via WebSocket
        io.to(receiverId).emit("receive_message", {
          senderId,
          content: encryptedMessage,
        });

      } catch (error) {
        console.error("Erro ao enviar mensagem:", error);
      }
    });

    // Desconexão
    socket.on("disconnect", () => {
      console.log("Cliente desconectado", socket.id);
    });
  });
}
