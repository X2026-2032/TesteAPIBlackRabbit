import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function listPagBank(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const listPagBank = await prisma.pagPlans.findMany({
      include: { taxes: true },
    });

    return reply.status(200).send(listPagBank);
  } catch (error: any) {
    throw new AppError(error);
  }
}
