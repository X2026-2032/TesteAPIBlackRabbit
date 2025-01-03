import { FastifyReply, FastifyRequest } from "fastify";
import { makeFetchAccountsUseCase } from "@/use-cases/factories/accounts/make-fetch-accounts-use-case";
import { z } from "zod";
import { AppError } from "@/use-cases/errors/app-error";

export async function fetchBackofficeAccounts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const querySchema = z.object({
      page: z.string().optional().default("1"),
      per_page: z.string().optional().default("20"),
      role: z.string(),
    });

    const queryParams = querySchema.parse(request.query);

    const factory = makeFetchAccountsUseCase();

    const result = await factory.execute(queryParams);

    return reply.status(200).send(result);
  } catch (error: any) {
    throw new AppError(error);
  }
}
