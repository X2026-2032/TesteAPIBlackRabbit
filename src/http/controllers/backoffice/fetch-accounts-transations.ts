import { FastifyReply, FastifyRequest } from "fastify";

import { AppError } from "@/use-cases/errors/app-error";
import { makeFetchBackofficeAccountTransactions } from "@/use-cases/factories/backoffice/make-fetch-accounts-transations";
import { z } from "zod";

export async function fetchBackofficeAccountsTransactions(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const querySchema = z.object({
      page: z.string().default("1"),
      per_page: z.string().default("30"),
      end_date: z.string().datetime().optional(),
      start_date: z.string().datetime().optional(),
    });

    const { id } = request.params as any;

    const params = querySchema.parse(request.query);

    const fetchUseCase = makeFetchBackofficeAccountTransactions();

    const transactions = await fetchUseCase.execute(id, params);

    return reply.status(200).send(transactions);
  } catch (error) {
    throw new AppError(error);
  }
}
