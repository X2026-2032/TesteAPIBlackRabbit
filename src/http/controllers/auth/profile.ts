import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function profile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: request.user.sub,
      },
    });

    if (!user) {
      throw new Error("Operador não encontrado");
    }

    const token = await reply.jwtSign(
      {
        role: user.role,
        type: user.access_token,
      },
      {
        sign: {
          sub: user.id,
          expiresIn: "7d",
        },
      },
    );

    const data = {
      user: {
        ...user,
        password: undefined,
        access_token: token,
      },
    };
    return reply.status(200).send(data);
  } catch (error: any) {
    throw new AppError(error);
  }
}
