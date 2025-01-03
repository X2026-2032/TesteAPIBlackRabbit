import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";

const feeLimitChangeRequestSchema = z.object({
  feePixIn: z.number(),
  feePixOut: z.number(),
  feeTedOut: z.number(),
  feeP2pOut: z.number(),
  feeBillet: z.number(),
  limitDay: z.number(),
  limitNightly: z.number(),
  limitMonth: z.number(),
  status: z.string(),
});

export async function listFeeLimitRequestLimit(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const waitingFeeLimit = await prisma.graphicAccount.findMany({
      include: {
        feeLimits: true,
        feeLimitChangeRequests: {
          where: {
            status: "waiting",
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      where: {
        feeLimitChangeRequests: {
          some: {
            status: "waiting",
          },
        },
      },
    });
    return reply.send(waitingFeeLimit);
  } catch (error: any) {
    throw new AppError(error);
  }
}
