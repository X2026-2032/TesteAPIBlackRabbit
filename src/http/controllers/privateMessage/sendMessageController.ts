import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";
import { encryptMessage } from "./encriptionAndDescription";
import { Server, Socket } from "socket.io";

// Interface para tipar os dados das mensagens
interface MessagePayload {
  senderId: string;
  receiverId: string;
  content: string;
  type: string;
}

// Este método agora precisa receber a instância do Socket.io
export async function sendMessage(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { senderId, receiverId, content, type } =
      request.body as MessagePayload;

    // Verificar se o remetente e o destinatário existem
    const sender = await prisma.graphicAccount.findUnique({
      where: { id: senderId },
    });
    const receiver = await prisma.graphicAccount.findUnique({
      where: { id: receiverId },
    });

    if (!sender || !receiver) {
      return reply.status(404).send({ message: "Usuário não encontrado" });
    }

    // Verificar se ambos têm chaves públicas configuradas
    if (!sender.publicKey || !receiver.publicKey) {
      return reply
        .status(400)
        .send({
          message: "Ambos os usuários devem ter chaves públicas configuradas.",
        });
    }

    // Criptografar o conteúdo da mensagem
    const encryptedContent = encryptMessage(
      content,
      receiver.publicKey as string,
    );

    // Salvar mensagem no banco de dados
    const message = await prisma.privateMessage.create({
      data: {
        content: encryptedContent,
        senderId: senderId,
        receiverId: receiverId,
        type: type,
      },
    });

    // Acessar a instância do socket.io
    const io: Server = request.app.io; // Acessando a instância do socket.io
    const receiverSocket: Socket | undefined =
      io.sockets.sockets.get(receiverId); // Buscando o socket do destinatário

    // Verificar se o socket do destinatário está conectado
    if (receiverSocket) {
      receiverSocket.emit("newMessage", {
        encryptedContent,
        senderId,
        receiverId,
        type,
      });
    } else {
      console.log("O destinatário não está conectado.");
    }

    return reply.status(201).send(message);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return reply
      .status(500)
      .send({ message: "Erro ao enviar mensagem", error: error });
  }
}
