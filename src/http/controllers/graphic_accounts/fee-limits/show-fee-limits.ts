import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";

export async function showFeeLimit(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const userId = request?.user?.sub;

    const existingFeeLimit = await prisma.graphicAccount.findUnique({
      where: { id: userId },
      include: {
        feeLimits: true,
        feeLimitChangeRequests: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (existingFeeLimit!.feeLimits?.length > 0) {
      return reply.status(200).send(existingFeeLimit);
    }

    await prisma.feeLimits.create({
      data: {
        GraphicAccount: { connect: { id: userId } },
      },
    });
    const newFeeLimit = await prisma.graphicAccount.findUnique({
      where: { id: userId },
      include: {
        feeLimits: true,
        feeLimitChangeRequests: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return reply.status(201).send(newFeeLimit);
  } catch (error: any) {
    throw new AppError(error);
  }
}
