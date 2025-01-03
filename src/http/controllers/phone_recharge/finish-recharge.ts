import { FastifyReply, FastifyRequest } from "fastify";
import { makeFinishRechargeUseCase } from "@/use-cases/factories/phone_recharge/make-phonefinishi-recharge";
import { z } from "zod";
import { AppError } from "@/use-cases/errors/app-error";

const finishRechargeUseCase = makeFinishRechargeUseCase();

export async function finishRecharge(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      amount: z.number(),
      pin: z.string().length(4),
    });

    const { id } = request.params as any;
    const data = schema.parse(request.body);

    const userId = request?.user?.sub;
    const response = await finishRechargeUseCase.execute(userId, id, data);
    return reply.status(200).send(response);
  } catch (error) {
    throw new AppError(error);
  }
}
