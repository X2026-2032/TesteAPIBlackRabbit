import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";

export async function listCardMachines(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const machines = await prisma.pagBankCardMachine.findMany({
      include: { graphicAccount: true },
    });
    return reply.status(200).send(machines);
  } catch (error: any) {
    throw new AppError(error);
  }
}
