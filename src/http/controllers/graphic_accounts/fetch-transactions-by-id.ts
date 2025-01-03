import { AppError } from "@/use-cases/errors/app-error";
import { makeFetchGrapicAccountTransactions } from "@/use-cases/factories/graphic_accounts/make-fetch-transaction-by-id";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function fetchGrapicAccountTransactionsById(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const querySchema = z.object({
      status: z.string().optional(),
      page: z.string().optional().default("1"),
      graphic_account_id: z.string().optional(),
      per_page: z.string().optional().default("20"),
    });
    const queryParams = querySchema.parse(request.query);

    const { id } = request.params as any;
    const factory = makeFetchGrapicAccountTransactions();

    const payment = await factory.execute(
      {
        graphic_id: id,
        userId: request.user.sub,
      },
      queryParams,
    );

    return reply.status(200).send(payment);
  } catch (error) {
    throw new AppError(error);
  }
}
