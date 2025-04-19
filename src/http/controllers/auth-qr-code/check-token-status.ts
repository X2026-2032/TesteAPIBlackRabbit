import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

export const CheckTokenStatus = async (
  request: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply,
) => {
  try {
    const { token } = request.params;
    let accessToken = null;
    let user = null;

    const qrToken = await prisma.qrToken.findUnique({
      where: { token },
    });

    if (!qrToken) {
      return reply.status(404).send({ error: "Token não encontrado" });
    }

    if (qrToken.status === "COMPLETED" && qrToken.graphicAccountId) {
      const graphicAccount = await prisma.graphicAccount.findUnique({
        where: { id: qrToken.graphicAccountId },
      });

      if (graphicAccount) {
        accessToken = await reply.jwtSign(
          {
            role: graphicAccount.role,
            type: graphicAccount.access_token,
          },
          {
            sign: {
              sub: graphicAccount.id,
              expiresIn: "30min",
            },
          },
        );
        user = graphicAccount;
      }
    }

    return reply.send({
      status: qrToken.status,
      userId: qrToken.graphicAccountId,
      expiresAt: qrToken.expiresAt,
      accessToken,
      user,
    });
  } catch (err: any) {
    throw new Error(err);
  }
};
