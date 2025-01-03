import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";

export async function showFeeLimitMasterDatabase(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const userId = request?.user?.sub;

    await prisma.user.findUnique({
      where: { id: userId },
      include: {
        FeeLimits: true,
        FeeLimitChangeRequest: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`Usuário não encontrado`);
    }

    const feeLimits = await prisma.feeLimits.findFirst({
      where: { userId: user.id },
    });

    return reply.status(200).send(feeLimits);
  } catch (error: any) {
    throw new AppError(error);
  }
}
