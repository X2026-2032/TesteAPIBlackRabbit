import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";

export async function fetchOperators(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const operators = await prisma.operatos.findMany();
    return reply.status(200).send(operators);
  } catch (error: any) {
    throw new AppError(error);
  }
}
