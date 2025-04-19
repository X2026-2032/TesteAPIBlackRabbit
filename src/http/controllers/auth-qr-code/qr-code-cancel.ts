import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

export const QrCodeCancel = async (
  request: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { token } = request.params;

    const qrToken = await prisma.qrToken.findUnique({
      where: { token },
    });

    if (!qrToken) {
      return reply.status(404).send({ error: "Token não encontrado" });
    }

    const updatedToken = await prisma.qrToken.update({
      where: { token },
      data: {
        status: "EXPIRED",
      },
    });

    return reply.send({
      status: updatedToken.status,
      token: updatedToken.token,
    });
  } catch (err: any) {
    throw new Error(err);
  }
};
