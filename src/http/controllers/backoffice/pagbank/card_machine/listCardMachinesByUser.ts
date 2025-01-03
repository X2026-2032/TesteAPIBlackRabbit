import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";

interface Params {
  graphic_account_id: string;
}

export async function listCardByUserMachines(
  request: FastifyRequest<{ Params: Params }>,
  reply: FastifyReply,
) {
  try {
    const { graphic_account_id } = request.params;

    const machines = await prisma.pagBankCardMachine.findMany({
      where: { graphic_account_id: graphic_account_id },
      include: { graphicAccount: true },
    });

    return reply.status(200).send(machines);
  } catch (error: any) {
    throw new AppError(error);
  }
}
