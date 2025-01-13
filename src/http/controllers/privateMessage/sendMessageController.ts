import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";
import { encryptMessage } from "./encriptionAndDescription";

// Interface para tipar os dados das mensagens
interface MessagePayload {
  senderId: string;
  receiverId: string;
  content: string;
}

export async function sendMessage(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { senderId, receiverId, content } = request.body as MessagePayload;

    // Obtendo os dados dos usuários
    const sender = await prisma.graphicAccount.findUnique({ where: { id: senderId } });
    const receiver = await prisma.graphicAccount.findUnique({ where: { id: receiverId } });

    if (!sender || !receiver) {
      return reply.status(404).send({ message: "Usuário não encontrado" });
    }

    // Criptografando a mensagem com a chave pública do destinatário
    const encryptedContent = encryptMessage(content, receiver.publicKey as string);

    // Salvando a mensagem criptografada no banco
    const message = await prisma.privateMessage.create({
      data: {
        content: encryptedContent,
        senderId: senderId,
        receiverId: receiverId,
      },
    });

    return reply.status(201).send(message);
  } catch (error) {
    return reply.status(500).send({ message: "Erro ao enviar mensagem" });
  }
}
