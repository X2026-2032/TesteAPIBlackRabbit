import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function FindUserAdmin(
  request: FastifyRequest | any,
  reply: FastifyReply,
) {
  try {
    if (request.params.document) {
      const user = await prisma.user.findUnique({
        where: {
          document: request.params.document,
        },
      });

      return reply.status(200).send(user);
    }
  } catch (error: any) {
    throw new AppError(error);
  }
}
