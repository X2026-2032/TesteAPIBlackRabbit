import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function showFeeLimitByAccountId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { accountId } = request.params as any;

    const graphicAccount = await prisma.graphicAccount.findFirst({
      where: {
        account_id: accountId,
      },
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

    return reply.status(201).send(graphicAccount);
  } catch (error: any) {
    throw new AppError(error);
  }
}
