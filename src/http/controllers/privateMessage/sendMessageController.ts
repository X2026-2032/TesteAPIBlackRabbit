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
    console.log("Request Body:", request.body); // Log para verificar o payload recebido
    const { senderId, receiverId, content } = request.body as MessagePayload;

    console.log("Buscando sender:", senderId);
    const sender = await prisma.graphicAccount.findUnique({ where: { id: senderId } });
    console.log("Sender encontrado:", sender);

    console.log("Buscando receiver:", receiverId);
    const receiver = await prisma.graphicAccount.findUnique({ where: { id: receiverId } });
    console.log("Receiver encontrado:", receiver);

    if (!sender || !receiver) {
      console.error("Usuário não encontrado");
      return reply.status(404).send({ message: "Usuário não encontrado" });
    }
    if (!sender.publicKey) {
      return reply.status(400).send({ message: "Sender não possui chave pública configurada." });
    }
    
    if (!receiver.publicKey) {
      return reply.status(400).send({ message: "Receiver não possui chave pública configurada." });
    }
    
    console.log("Iniciando criptografia");
    const encryptedContent = encryptMessage(content, receiver.publicKey as string);
    console.log("Mensagem criptografada:", encryptedContent);

    console.log("Salvando mensagem no banco");
    const message = await prisma.privateMessage.create({
      data: {
        content: encryptedContent,
        senderId: senderId,
        receiverId: receiverId,
      },
    });
    console.log("Mensagem salva:", message);

    return reply.status(201).send(message);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return reply.status(500).send({ message: "Erro ao enviar mensagem", error: error });
  }
}
