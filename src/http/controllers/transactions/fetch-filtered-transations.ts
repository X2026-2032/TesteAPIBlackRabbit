import { AppError } from "@/use-cases/errors/app-error";
import { makeFetchTransactionsCase } from "@/use-cases/factories/make-fetch-transactions-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

interface RouteParams {
  start: string;
  end: string;
}
export async function fetchFilteredTransactions(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { start, end } = request.params as { start: string; end: string };

    const querySchema = z.object({
      page: z.string().optional().default("1"),
      per_page: z.string().optional().default("20"),
      status: z.enum(["waiting", "paid"]).optional(),
      graphic_account_id: z.string().optional(),
    });

    const queryParams = querySchema.parse(request.query);

    const fetchUseCase = makeFetchTransactionsCase();

    const { transactions } = await fetchUseCase.execute(
      request.user.sub,
      queryParams,
    );

    return reply.status(200).send(transactions);
  } catch (error: any) {
    throw new AppError(error);
  }
}
