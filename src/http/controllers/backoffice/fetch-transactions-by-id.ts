import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { makeFetchBackofficeTransactionsByIdCase } from "@/use-cases/factories/backoffice/make-fetch-transactions-by-id";

export async function fetchBackofficeTransactionsById(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as any;

    if (!id) throw new AppError({ message: "Id não encontrado" });

    const factory = makeFetchBackofficeTransactionsByIdCase();

    const response = await factory.execute(id);
    return reply.status(200).send(response);
  } catch (error) {
    throw new AppError(error);
  }
}
