import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function showFeeLimitById(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as any;
    const existingFeeLimit = await prisma.graphicAccount.findUnique({
      where: { id: id },
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
        GraphicAccount: { connect: { id: id } },
      },
    });

    const newFeeLimit = await prisma.graphicAccount.findUnique({
      where: { id: id },
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
