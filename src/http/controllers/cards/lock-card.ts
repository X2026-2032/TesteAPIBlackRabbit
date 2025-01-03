import { makeLockCardUseCase } from "@/use-cases/factories/cards/make-lock-card-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function lockCard(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    id: z.string(),
  });

  const { id } = schema.parse(request.params);

  const lockCardUseCase = makeLockCardUseCase();

  return lockCardUseCase.execute({
    userId: request.user.sub,
    cardId: id,
  });
}
