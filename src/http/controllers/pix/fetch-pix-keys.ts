import { AppError } from "@/use-cases/errors/app-error";
import { makeFetchPixKeysCase } from "@/use-cases/factories/make-fetch-pix-keys-use-case";
import { FastifyReply, FastifyRequest } from "fastify";

export async function fetchPixKeys(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const fetchUseCase = makeFetchPixKeysCase();

    const keys = await fetchUseCase.execute({
      userId: request.user.sub,
    });

    return reply.status(200).send(keys);
  } catch (error: any) {
    throw new AppError(error);
  }
}
