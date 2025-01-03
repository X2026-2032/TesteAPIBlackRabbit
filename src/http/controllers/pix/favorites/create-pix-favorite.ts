import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";

export async function createPixFavoriteController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const schema = z.object({
      contactName: z.string(),
      keyPix: z.string(),
      keyType: z.string(),
    });

    const { contactName, keyPix, keyType } = schema.parse(request.body);

    const userId = request?.user?.sub;

    // Verifique se o pixFavorite já existe
    const pixFavorite = await prisma.pixFavorites.findFirst({
      where: {
        userId: userId,
        keyPix: keyPix,
      },
    });

    if (pixFavorite) {
      throw new Error("PixFavorite already exists");
    }

    const newPixFavorite = await prisma.pixFavorites.create({
      data: {
        userId: userId,
        contactName,
        keyPix,
        keyType,
      },
    });

    return reply.status(201).send(newPixFavorite);
  } catch (error: any) {
    throw new AppError(error);
  }
}
