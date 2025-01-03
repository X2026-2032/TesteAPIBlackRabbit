import { AppError } from "@/use-cases/errors/app-error";
import { makeFetchTransactionByIdCase } from "@/use-cases/factories/make-fetch-transactions-by-id-use-case";
import { FastifyReply, FastifyRequest } from "fastify";

export async function fetchTransactionById(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as any;

    const fetchUseCase = makeFetchTransactionByIdCase();

    const transaction = await fetchUseCase.execute({
      userId: request.user.sub,
      id,
    });

    return reply.status(200).send(transaction);
  } catch (error) {
    throw new AppError(error);
  }
}
