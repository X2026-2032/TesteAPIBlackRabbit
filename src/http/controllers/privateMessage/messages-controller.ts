import { FastifyReply, FastifyRequest } from "fastify";
import { Server } from "socket.io";
import { prisma } from "@/lib/prisma";

// Interface para tipar os dados das mensagens
interface MessagePayload {
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
}

// Função para enviar mensagens
export async function sendMessage(
  request: FastifyRequest,
  reply: FastifyReply,
  io: Server
) {
  try {
    const { senderId, receiverId, content, type } = request.body as MessagePayload;

    // Salva mensagem no banco de dados
    const message = await prisma.privateMessage.create({
      data: { senderId, receiverId, content, type, },
    });

    // Emite mensagem para o destinatário via WebSocket
    io.to(receiverId).emit("receive_message", message);

    reply.status(201).send({ message: "Mensagem enviada com sucesso" });
  } catch (error) {
    reply.status(500).send({ error: "Erro ao enviar mensagem" });
  }
}

// Função para buscar mensagens de um chat
export async function getMessages(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { receiverId } = request.params as { receiverId: string };
    const { senderId } = request.query as { senderId: string };

    const messages = await prisma.privateMessage.findMany({
      where: { senderId, receiverId },
      orderBy: { createdAt: "asc" },
    });

    reply.send({ messages });
  } catch (error) {
    reply.status(500).send({ error: "Erro ao buscar mensagens" });
  }
}

// Função para salvar chave pública
export async function savePublicKey(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const { publicKey } = request.body as { publicKey: string };

    await prisma.graphicAccount.update({
      where: { id },
      data: { publicKey },
    });

    reply.send({ message: "Chave pública salva com sucesso" });
  } catch (error) {
    reply.status(500).send({ error: "Erro ao salvar chave pública" });
  }
}

// Função para buscar chave pública
export async function getPublicKey(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.params as { id: string };
    const { publicKey } = request.body as { publicKey: string };

    const user = await prisma.graphicAccount.findUnique({
      where: { id },
      select: { publicKey: true },
    });

    if (!user) {
      return reply.status(404).send({ message: "Usuário não encontrado" });
    }

    reply.send({ publicKey: user.publicKey as string });
  } catch (error) {
    reply.status(500).send({ error: "Erro ao buscar chave pública" });
  }
}
