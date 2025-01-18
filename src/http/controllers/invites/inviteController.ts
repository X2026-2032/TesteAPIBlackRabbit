import { prisma } from "@/lib/prisma";
import { FastifyRequest, FastifyReply } from "fastify";

// Interface para tipar os dados das mensagens
interface InvitePayload {
  senderId: string;
  receiverId: string;
}

// Enviar convite
export const sendInvite = async (req: FastifyRequest, reply: FastifyReply) => {
  const { senderId, receiverId } = req.body as InvitePayload;

  try {
    const sender = await prisma.graphicAccount.findUnique({ where: { id: senderId } });
    const receiver = await prisma.graphicAccount.findUnique({ where: { id: receiverId } });

    if (!sender || !receiver) {
      return reply.status(404).send({ error: "Usuário não encontrado" });
    }

    const existingInvite = await prisma.invite.findFirst({
      where: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    if (existingInvite) {
      return reply.status(400).send({ error: "Convite já enviado" });
    }

    await prisma.invite.create({
      data: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    return reply.status(200).send({ message: "Convite enviado com sucesso" });
  } catch (error) {
    console.error("Erro ao enviar convite:", error);
    return reply.status(500).send({ error: "Erro ao enviar convite" });
  }
};

// Aceitar convite
export const acceptInvite = async (req: FastifyRequest, reply: FastifyReply) => {
  const { senderId, receiverId } = req.body as InvitePayload;

  try {
    const invite = await prisma.invite.findFirst({
      where: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    if (!invite) {
      return reply.status(404).send({ error: "Convite não encontrado ou já foi aceito/rejeitado" });
    }

    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    });

    // Adicionar ambos os usuários à lista de contatos
    await prisma.contact.create({
      data: {
        contactId: senderId,
        graphicAccountId: receiverId,
      },
    });

    await prisma.contact.create({
      data: {
        contactId: receiverId,
        graphicAccountId: senderId,
      },
    });

    return reply.status(200).send({ message: "Convite aceito e contatos adicionados" });
  } catch (error) {
    console.error("Erro ao aceitar convite:", error);
    return reply.status(500).send({ error: "Erro ao aceitar convite" });
  }
};

// Recusar convite
export const rejectInvite = async (req: FastifyRequest, reply: FastifyReply) => {
  const { senderId, receiverId } = req.body as InvitePayload;

  try {
    const invite = await prisma.invite.findFirst({
      where: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    if (!invite) {
      return reply.status(404).send({ error: "Convite não encontrado ou já foi aceito/rejeitado" });
    }

    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "REJECTED" },
    });

    return reply.status(200).send({ message: "Convite recusado" });
  } catch (error) {
    console.error("Erro ao recusar convite:", error);
    return reply.status(500).send({ error: "Erro ao recusar convite" });
  }
};
