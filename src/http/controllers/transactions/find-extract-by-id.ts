import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { makeFetchTransactionByIdCase } from "@/use-cases/factories/make-fetch-transactions-by-id-use-case";
import { FastifyReply, FastifyRequest } from "fastify";

export async function findExtractById(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as any;

    if (!id) return reply.status(400).send();

    const userTransaction = await prisma.accountTransaction.findFirst({
      where: { id: id },
    });

    if (userTransaction) return reply.status(200).send(userTransaction);

    const graphicAccountTransaction =
      await prisma.graphicAccountTransaction.findFirst({ where: { id: id } });

    if (graphicAccountTransaction)
      return reply.status(200).send(graphicAccountTransaction);

    return reply.status(400).send();
  } catch (error: any) {
    throw new AppError(error);
  }
}
