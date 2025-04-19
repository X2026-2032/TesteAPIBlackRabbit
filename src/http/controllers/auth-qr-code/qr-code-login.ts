import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

export const QrCodeLogin = async (
  request: FastifyRequest<{ Body: { token: string; user: User } }>,
  reply: FastifyReply,
) => {
  try {
    const { token, user } = request.body;

    const qrToken = await prisma.qrToken.findUnique({
      where: { token },
    });

    if (!qrToken) {
      return reply.status(404).send({ error: "Token não encontrado" });
    }

    if (qrToken.status !== "PENDING") {
      return reply
        .status(400)
        .send({ error: "QR code já utilizado ou expirado" });
    }

    if (qrToken.expiresAt < new Date()) {
      await prisma.qrToken.update({
        where: { token },
        data: { status: "EXPIRED" },
      });

      return reply.status(400).send({ error: "QR code expirado" });
    }

    const userExist = await prisma.graphicAccount.findUnique({
      where: { id: user.id },
    });

    if (!userExist) {
      throw new Error(`Usuário com ID ${user.id} não encontrado`);
    }

    const updatedToken = await prisma.qrToken.update({
      where: { token },
      data: {
        status: "COMPLETED",
        graphicAccountId: userExist.id,
      },
    });

    return reply.send({
      status: updatedToken.status,
      userId: updatedToken.graphicAccountId,
    });
  } catch (err: any) {
    throw new Error(err);
  }
};
