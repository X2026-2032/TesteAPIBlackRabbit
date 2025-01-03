import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  keyPix: string;
}

export async function checkPixFavoriteController(
  request: FastifyRequest<{ Params: RouteParams }>,
  reply: FastifyReply,
): Promise<void> {
  try {
    const userId = request?.user?.sub;
    const pixFavorites = await prisma.pixFavorites.findMany({
      where: {
        userId: userId,
        keyPix: request.params.keyPix,
      },
    });

    const isFavorite = pixFavorites.length > 0;

    return reply.status(200).send({ isFavorite });
  } catch (error: any) {
    throw new AppError(error);
  }
}
