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

  console.log("[sendInvite] Payload recebido:", { senderId, receiverId });

  try {
    const sender = await prisma.graphicAccount.findUnique({ where: { id: senderId } });
    const receiver = await prisma.graphicAccount.findUnique({ where: { id: receiverId } });

    console.log("[sendInvite] Verificando usuários:", { sender, receiver });

    if (!sender || !receiver) {
      console.log("[sendInvite] Usuário não encontrado.");
      return reply.status(404).send({ error: "Usuário não encontrado" });
    }

    const existingInvite = await prisma.invite.findFirst({
      where: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    console.log("[sendInvite] Convite existente:", existingInvite);

    if (existingInvite) {
      console.log("[sendInvite] Convite já enviado.");
      return reply.status(400).send({ error: "Convite já enviado" });
    }

    const newInvite = await prisma.invite.create({
      data: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    console.log("[sendInvite] Novo convite criado:", newInvite);

    return reply.status(200).send({ message: "Convite enviado com sucesso" });
  } catch (error) {
    console.error("[sendInvite] Erro ao enviar convite:", error);
    return reply.status(500).send({ error: "Erro ao enviar convite" });
  }
};

// Aceitar convite
export const acceptInvite = async (req: FastifyRequest, reply: FastifyReply) => {
  const { senderId, receiverId } = req.body as InvitePayload;

  console.log("[acceptInvite] Payload recebido:", { senderId, receiverId });

  try {
    const invite = await prisma.invite.findFirst({
      where: {
        OR: [
          {
            senderId,
            receiverId,
            status: "PENDING",
          },
          {
            senderId: receiverId,
            receiverId: senderId,
            status: "PENDING",
          },
        ],
      },
    });

    console.log("[acceptInvite] Convite encontrado:", invite);

    if (!invite) {
      console.log("[acceptInvite] Convite não encontrado ou já processado.");
      return reply.status(404).send({ error: "Convite não encontrado ou já foi aceito/rejeitado" });
    }

    const updatedInvite = await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    });

    console.log("[acceptInvite] Convite aceito:", updatedInvite);

    const contact1 = await prisma.contact.create({
      data: {
        contactId: senderId,
        graphicAccountId: receiverId,
      },
    });

    console.log("[acceptInvite] Contato criado (1):", contact1);

    const contact2 = await prisma.contact.create({
      data: {
        contactId: receiverId,
        graphicAccountId: senderId,
      },
    });

    console.log("[acceptInvite] Contato criado (2):", contact2);

    return reply.status(200).send({ message: "Convite aceito e contatos adicionados" });
  } catch (error) {
    console.error("[acceptInvite] Erro ao aceitar convite:", error);
    return reply.status(500).send({ error: "Erro ao aceitar convite" });
  }
};

// Recusar convite
export const rejectInvite = async (req: FastifyRequest, reply: FastifyReply) => {
  const { senderId, receiverId } = req.body as InvitePayload;

  console.log("[rejectInvite] Payload recebido:", { senderId, receiverId });

  try {
    const invite = await prisma.invite.findFirst({
      where: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    console.log("[rejectInvite] Convite encontrado:", invite);

    if (!invite) {
      console.log("[rejectInvite] Convite não encontrado ou já processado.");
      return reply.status(404).send({ error: "Convite não encontrado ou já foi aceito/rejeitado" });
    }

    const updatedInvite = await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "REJECTED" },
    });

    console.log("[rejectInvite] Convite recusado:", updatedInvite);

    return reply.status(200).send({ message: "Convite recusado" });
  } catch (error) {
    console.error("[rejectInvite] Erro ao recusar convite:", error);
    return reply.status(500).send({ error: "Erro ao recusar convite" });
  }
};
