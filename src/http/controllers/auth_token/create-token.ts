import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

const generateToken = async (user: any, reply: FastifyReply) => {
  const token = await reply.jwtSign(
    {
      role: user.role,
    },
    {
      sign: {
        sub: user.id,
      },
    },
  );

  return token;
};

export const CreateAuthToken = async (
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
    if (user) {
      const token = await generateToken(user, reply);
      await prisma.authToken.deleteMany({
        where: {
          user_id: user.id,
        },
      });
      await prisma.authToken.create({
        data: {
          user_id: user.id,
          token,
        },
      });
      reply.send(token);
    } else {
      const graphic = await prisma.graphicAccount.findUnique({
        where: {
          id: userId,
        },
      });
      if (!graphic) {
        throw new Error("Usuário não encontrado");
      }
      const token = await generateToken(graphic, reply);
      await prisma.authToken.deleteMany({
        where: {
          graphic_account_id: graphic.id,
        },
      });
      await prisma.authToken.create({
        data: {
          graphic_account_id: graphic.id,
          token,
        },
      });

      reply.send(token);
    }
  } catch (err: any) {
    throw new Error(err);
  }
};
