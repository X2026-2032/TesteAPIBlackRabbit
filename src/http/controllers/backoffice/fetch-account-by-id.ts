import { FastifyReply, FastifyRequest } from "fastify";
import { makeFetchByIdUseCase } from "@/use-cases/factories/accounts/make-fetch-by-id-use-case";
import { AppError } from "@/use-cases/errors/app-error";

export async function fetchBackofficeAccountsById(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { params, query } = request;

    const factory = makeFetchByIdUseCase();

    const result = await factory.execute({
      id: (params as any)?.id ?? "",
      role: query?.role,
    });
    return reply.status(200).send(result);
  } catch (error: any) {
    throw new AppError(error);
  }
}
