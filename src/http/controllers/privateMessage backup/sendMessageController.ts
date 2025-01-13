import { FastifyReply, FastifyRequest } from "fastify";
import { Server } from "socket.io";
import { prisma } from "@/lib/prisma";
import { encryptMessage } from "./encriptionAndDescription";

// Função para enviar a mensagem via WebSocket
export async function sendMessage(request: FastifyRequest, reply: FastifyReply, io: Server) {
  try {
    const { senderId, receiverId, content } = request.body;

    // Obtendo os dados dos usuários
    const sender = await prisma.graphicAccount.findUnique({ where: { id: senderId } });
    const receiver = await prisma.graphicAccount.findUnique({ where: { id: receiverId } });

    if (!sender || !receiver) {
      return reply.status(404).send({ message: "Usuário não encontrado" });
    }

    // Criptografando a mensagem
    const encryptedMessage = encryptMessage(content, receiver.publicKey);

    // Salvando a mensagem criptografada
    await prisma.privateMessage.create({
      data: { senderId, receiverId, content: encryptedMessage },
    });

    // Enviando a mensagem criptografada via WebSocket
    io.to(receiverId).emit("receive_message", {
      senderId,
      content: encryptedMessage,
    });

    return reply.status(200).send({ message: "Mensagem enviada com sucesso" });

  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return reply.status(500).send({ message: "Erro ao enviar mensagem" });
  }
}
