import { makeCreateCardUseCase } from "@/use-cases/factories/cards/make-create-card-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createCard(request: FastifyRequest, reply: FastifyReply) {
  const schema = z.object({
    type: z.string(),
    "#allow_ecommerce": z.boolean(),
    "#allow_withdrawal": z.boolean(),
    "#allow_intl_purchase": z.boolean(),
    "#allow_mcc_control": z.boolean(),
    "#allow_contactless": z.boolean(),
    "#contactless_limit": z.number(),
  });

  const data = schema.parse(request.body);

  const createCardUseCase = makeCreateCardUseCase();

  return createCardUseCase.execute({
    userId: request.user.sub,
    data: data as any,
  });
}
