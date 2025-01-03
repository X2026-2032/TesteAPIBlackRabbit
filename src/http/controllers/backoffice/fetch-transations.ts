import { AppError } from "@/use-cases/errors/app-error";
import { makeFetchBackofficeTransactionsCase } from "@/use-cases/factories/backoffice/make-fetch-transactions-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function fetchBackofficeTransactions(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const querySchema = z.object({
      page: z.string().default("1"),
      per_page: z.string().default("10"),
      role: z.string(),
      end_date: z.string().optional(),
      start_date: z.string().optional(),
    });

    const { page, per_page, role, end_date, start_date } = querySchema.parse(
      request.query,
    );

    const fetchUseCase = makeFetchBackofficeTransactionsCase();

    const transactions = await fetchUseCase.execute({
      page,
      role,
      per_page,
      startDate: start_date ? start_date : "",
      endDate: end_date ? end_date : "",
    });

    return reply.status(200).send(transactions);
  } catch (error: any) {
    throw new AppError(error);
  }
}
