import { io } from "@/app";
import { prisma } from "@/lib/prisma";
import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

// Interface para os dados do convite
interface InvitePayload {
  senderId: string;
  receiverId: string;
}

// Enviar convite
export const sendInvite = async (req: FastifyRequest, reply: FastifyReply) => {
  const { senderId, receiverId } = req.body as InvitePayload;

  try {
    const sender = await prisma.graphicAccount.findUnique({
      where: { id: senderId },
    });
    const receiver = await prisma.graphicAccount.findUnique({
      where: { id: receiverId },
    });

    if (!sender || !receiver) {
      return reply.status(404).send({ error: "Usuário não encontrado" });
    }
    console.log(sender)
    console.log(receiver)
    // Verifica se o convite já existe
    const existingInvite = await prisma.invite.findFirst({
      where: {
        senderId,
        receiverId,
        status: {
          not: "REMOVED",
        },
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

      return reply
        .status(200)
        .send({ message: "Convite reenviado com sucesso" });
    }

    // Criar um novo convite
    const newInvite = await prisma.invite.create({
      data: {
        senderId,
        receiverId,
        status: "PENDING",
      },
    });

    // Incluindo a chave pública de João Batata no convite (dentro do convite)
    const inviteData = {
      message: "Convite enviado com sucesso",
      invite: newInvite,
      publicKey: receiver.publicKey, // Adicionando a chave pública
    };

    io.to(receiverId).emit("new_notification", {
      title: "Você foi convidado para uma nova conversa",
      message:
        "Você acaba de receber um convite para uma nova conversa privada.",
      type: "success",
      isRead: false,
    });
    return reply.status(200).send(inviteData);
  } catch (error) {
    console.error("Erro ao enviar convite:", error);
    return reply.status(500).send({ error: "Erro ao enviar convite" });
  }
};
// Aceitar convite
export const acceptInvite = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  const { senderId, receiverId } = req.body as InvitePayload;

  try {
    // Verifica se o convite existe e está pendente
    const invite = await prisma.invite.findFirst({
      where: {
        OR: [
          { senderId, receiverId, status: "PENDING" },
          { senderId: receiverId, receiverId: senderId, status: "PENDING" },
        ],
      },
    });

    if (!invite) {
      return reply
        .status(404)
        .send({ error: "Convite não encontrado ou já processado" });
    }

    // Atualiza o status do convite para aceito
    const updatedInvite = await prisma.invite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    });

    // Cria os contatos bidirecionais
    await prisma.contact.createMany({
      data: [
        { graphicAccountId: senderId, contactId: receiverId },
        { graphicAccountId: receiverId, contactId: senderId },
      ],
    });

    // Obtém a chave pública do remetente (senderId)
    const sender = await prisma.graphicAccount.findUnique({
      where: { id: senderId },
    });

    if (!sender || !sender.publicKey) {
      return reply
        .status(404)
        .send({ error: "Chave pública do remetente não encontrada" });
    }

    io.to(senderId).emit("invite_accepted", {
      userId: senderId,
      userName: sender.userName,
    });

    // Retorna a resposta com o convite atualizado e a chave pública
    return reply.status(200).send({
      message: "Convite aceito e contatos adicionados",
      invite: updatedInvite, // Retorna o convite atualizado
      publicKey: sender.publicKey, // Envia a chave pública de João Batata para Rogério
    });
  } catch (error) {
    console.error("Erro ao aceitar convite:", error);
    return reply.status(500).send({ error: "Erro ao aceitar convite" });
  }
};

// Recusar convite
export const rejectInvite = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
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
      return reply
        .status(404)
        .send({ error: "Convite não encontrado ou já processado" });
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

// Listar convites
export const listInvites = async (req: FastifyRequest, reply: FastifyReply) => {
  console.log("Recebendo requisição para listar convites...");

  let userId: string | undefined;

  try {
    const authHeader = req.headers.authorization;
    console.log("Cabeçalho de autorização:", authHeader);

    if (!authHeader) {
      console.log("Token de autorização ausente.");
      return reply.status(401).send({ error: "Token de autorização ausente" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token extraído:", token);

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as { sub: string };
    userId = decodedToken.sub;
    console.log("User ID extraído do token:", userId);

    if (!userId) {
      console.log("Falha ao extrair o ID do usuário do token.");
      return reply
        .status(400)
        .send({ error: "Falha ao identificar o usuário" });
    }

    // Verificar se o usuário existe
    console.log("Verificando existência do usuário...");
    const user = await prisma.graphicAccount.findUnique({
      where: { id: userId },
    });
    console.log("Usuário encontrado:", user);

    if (!user) {
      console.log("Usuário não encontrado!");
      return reply.status(404).send({ error: "Usuário não encontrado" });
    }

    // Buscar todos os convites relacionados ao usuário
    console.log("Buscando convites relacionados ao usuário...");
    const invites = await prisma.invite.findMany({
      where: {
        OR: [
          { senderId: userId }, // Convites enviados pelo usuário
          { receiverId: userId }, // Convites recebidos pelo usuário
        ],
      },
      include: {
        sender: { select: { id: true, userName: true } }, // Informações do remetente
        receiver: { select: { id: true, userName: true } }, // Informações do destinatário
      },
    });
    console.log("Convites encontrados:", invites);

    return reply.status(200).send({ invites });
  } catch (error) {
    console.error("Erro ao listar convites:", error);
    return reply.status(500).send({ error: "Erro ao listar convites" });
  }
};
