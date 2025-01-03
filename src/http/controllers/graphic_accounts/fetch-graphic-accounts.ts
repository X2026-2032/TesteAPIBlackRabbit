import { AppError } from "@/use-cases/errors/app-error";
import { makeFetchGrapicAccountUseCase } from "@/use-cases/factories/graphic_accounts/make-fetch-graphic_accounts-use-case";

import { FastifyReply, FastifyRequest } from "fastify";

export async function fetchGraphicAccounts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const fetchGrapicAccountUseCase = makeFetchGrapicAccountUseCase();

    const isUserId =
      request.user.sub === undefined || request.user.sub === null
        ? "faaa6ca6-53c4-4699-b72f-ca9067621baa"
        : request.user.sub;

    const accounts = await fetchGrapicAccountUseCase.execute({
      userId: isUserId,
    });

    return reply.status(200).send(accounts);
  } catch (error) {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({ error: error.message });
    } else {
      reply.status(500).send({ error: "Internal Server Error" });
    }
  }
}
