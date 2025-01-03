import { AppError } from "@/use-cases/errors/app-error";
import { makeGetAccountByDocumentUseCase } from "@/use-cases/factories/make-get-account-by-document-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function getAccountByDocument(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const querySchema = z.object({
      document: z.string(),
    });

    const { document } = querySchema.parse(request.query);

    const getAccountByDocumentUseCase = makeGetAccountByDocumentUseCase();

    const account = await getAccountByDocumentUseCase.execute({
      document,
    });

    return reply.status(200).send(account);
  } catch (error) {
    throw new AppError(error);
  }
}
