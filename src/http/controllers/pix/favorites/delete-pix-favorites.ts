import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  id: string;
}

export async function deletePixFavoriteController(
  request: FastifyRequest<{ Params: RouteParams }>,
  reply: FastifyReply,
): Promise<void> {
  try {
    const userId = request?.user?.sub;
    const pixFavoriteIdToDelete = request.params.id;

    // Verifique se o pixFavorite pertence ao usuário logado antes de excluí-lo
    const pixFavorite = await prisma.pixFavorites.findFirst({
      where: {
        id: pixFavoriteIdToDelete,
        userId: userId,
      },
    });

    if (!pixFavorite) {
      throw new Error(
        "PixFavorite not found or does not belong to the logged-in user",
      );
    }

    await prisma.pixFavorites.delete({
      where: {
        id: pixFavoriteIdToDelete,
      },
    });

    reply.status(200).send({ message: "Favorito deletado com sucesso." });
  } catch (error: any) {
    throw new AppError(error);
  }
}
