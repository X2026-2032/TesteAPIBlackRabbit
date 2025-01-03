import { AppError } from "@/use-cases/errors/app-error";
import { makeFetchBackofficeBankTransfers } from "@/use-cases/factories/backoffice/make-fetch-bank-transfers";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function fetchBackofficeBankTransfers(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const querySchema = z.object({
      page: z.string().default("1"),
      status: z.string().optional(),
      per_page: z.string().default("30"),
      end_date: z.string().datetime().optional(),
      start_date: z.string().datetime().optional(),
    });

    const params = querySchema.parse(request.query);

    const fetchUseCase = makeFetchBackofficeBankTransfers();

    const response = await fetchUseCase.execute(params);
    return reply.status(200).send(response);
  } catch (error) {
    throw new AppError(error);
  }
}
