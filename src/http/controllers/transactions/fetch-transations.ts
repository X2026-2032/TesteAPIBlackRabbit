import { AppError } from "@/use-cases/errors/app-error";
import { makeFetchTransactionsCase } from "@/use-cases/factories/make-fetch-transactions-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function fetchTransactions(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const queryParams = request.query as {
      start: string;
      end: string;
      page: number;
      perPage: number;
    };

    const fetchUseCase = makeFetchTransactionsCase();

    const transactions = await fetchUseCase.execute(
      request.user.sub,
      queryParams,
    );

    return reply.status(200).send(transactions);
  } catch (error: any) {
    throw new AppError(error);
  }
}
