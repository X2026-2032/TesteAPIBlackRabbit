import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";

export async function listPixFavoritesController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const userId = request?.user?.sub;

    const pixFavorites = await prisma.pixFavorites.findMany({
      where: {
        userId: userId,
      },
    });

    return reply.status(200).send(pixFavorites);
  } catch (error: any) {
    throw new AppError(error);
  }
}
