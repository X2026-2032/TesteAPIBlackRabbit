import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

export const CheckTokenStatus = async (
  request: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { token } = request.params;

    const qrToken = await prisma.qrToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!qrToken) {
      return reply.status(404).send({ error: "Token não encontrado" });
    }

    return reply.send({
      status: qrToken.status,
      userId: qrToken.userId,
      user: qrToken.user,
      expiresAt: qrToken.expiresAt,
    });
  } catch (err: any) {
    throw new Error(err);
  }
};
