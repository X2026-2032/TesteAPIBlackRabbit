import { prisma } from "@/lib/prisma";
import { FastifyRequest, FastifyReply } from "fastify";

// Interface para os dados do convite
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

 // Verificar se já existe um convite entre os usuários
const existingInvite = await prisma.invite.findFirst({
  where: {
    OR: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  },
});

if (existingInvite) {
  if (existingInvite.status === "ACCEPTED") {
    return reply.status(400).send({ error: "Convite já aceito" });
  }

  if (existingInvite.status === "PENDING") {
    return reply.status(400).send({ error: "Convite já enviado" });
  }

  // Se o convite foi recusado, atualizá-lo para reenviado (PENDING)
  await prisma.invite.update({
    where: { id: existingInvite.id },
    data: { status: "PENDING", updated_at: new Date() },
  });

  return reply.status(200).send({ message: "Convite reenviado com sucesso" });
}

// Criar um novo convite caso não exista nenhum registro entre os usuários
const newInvite = await prisma.invite.create({
  data: { senderId, receiverId, status: "PENDING" },
});

    return reply.status(200).send({ message: "Convite enviado com sucesso", invite: newInvite });
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
        OR: [
          { senderId, receiverId, status: "PENDING" },
          { senderId: receiverId, receiverId: senderId, status: "PENDING" },
        ],
      },
    });

    if (!invite) {
      return reply.status(404).send({ error: "Convite não encontrado ou já processado" });
    }

    // Atualizar status do convite para aceito
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    });

    // Criar contatos bidirecionais
    await prisma.contact.createMany({
      data: [
        { graphicAccountId: senderId, contactId: receiverId },
        { graphicAccountId: receiverId, contactId: senderId },
      ],
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
        OR: [
          { senderId, receiverId, status: "PENDING" },
          { senderId: receiverId, receiverId: senderId, status: "PENDING" },
        ],
      },
    });

    if (!invite) {
      return reply.status(404).send({ error: "Convite não encontrado ou já processado" });
    }

    // Atualizar status do convite para recusado
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
