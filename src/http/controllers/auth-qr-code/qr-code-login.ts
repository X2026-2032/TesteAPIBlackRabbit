import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

export const QrCodeLogin = async (
  request: FastifyRequest<{ Body: { token: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { token } = request.body;

    const qrToken = await prisma.qrToken.findUnique({
      where: { token },
    });

    if (!qrToken) {
      return reply.status(404).send({ error: "Token não encontrado" });
    }

    if (qrToken.status !== "PENDING") {
      return reply
        .status(400)
        .send({ error: "Token já utilizado ou expirado" });
    }

    if (qrToken.expiresAt < new Date()) {
      await prisma.qrToken.update({
        where: { token },
        data: { status: "EXPIRED" },
      });
      return reply.status(400).send({ error: "Token expirado" });
    }

    const user = request.user;

    const updatedToken = await prisma.qrToken.update({
      where: { token },
      data: {
        status: "COMPLETED",
        userId: user.id,
      },
    });

    return reply.send({
      status: updatedToken.status,
      userId: updatedToken.userId,
    });
  } catch (err: any) {
    throw new Error(err);
  }
};
