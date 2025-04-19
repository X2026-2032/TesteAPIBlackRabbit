import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";
import { decryptMessage } from "./encriptionAndDescription";

// Interface para tipar os dados das mensagens
interface MessagePayload {
  senderId: string;
  receiverId: string;
  content: string;
}

export async function getMessages(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { senderId, receiverId } = request.body as MessagePayload;

    // Buscando mensagens criptografadas no banco
    const messages = await prisma.privateMessage.findMany({
      where: { senderId, receiverId },
      orderBy: { createdAt: "asc" },
    });

    // Descriptografando as mensagens
    // const decryptedMessages = messages.map((msg: { content: string; }) => ({
    //   ...msg,
    //   content: decryptMessage(msg.content, receiverId), // Use a chave privada do destinatário
    // }));

    // reply.send({ messages: decryptedMessages });
  } catch (error) {
    return reply.status(500).send({ error: "Erro ao buscar mensagens" });
  }
}
