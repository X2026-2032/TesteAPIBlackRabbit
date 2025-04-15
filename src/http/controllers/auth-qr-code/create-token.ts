import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

const generateToken = async (user: any, reply: FastifyReply) => {
  const token = await reply.jwtSign(
    {
      role: user.role,
      status: "PENDING",
    },
    {
      sign: {
        sub: user.id,
        expiresIn: "3m",
      },
    },
  );

  return token;
};

export const CreateTokenQrCode = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) => {
  try {
    const userId = request.params.id;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return reply.status(404).send({ error: "Usuário não encontrado" });
    }

    const token = await generateToken(user, reply);
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await prisma.qrToken.create({
      data: {
        token,
        userId: user.id,
        status: "PENDING",
        expiresAt,
      },
    });

    reply.send({
      token,
      expiresAt,
      status: "PENDING",
    });
  } catch (err: any) {
    throw new Error(err);
  }
};
