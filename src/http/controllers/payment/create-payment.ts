import { AppError } from "@/use-cases/errors/app-error";
import { makeCreatePaymentUseCase } from "@/use-cases/factories/make-create-payment-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createPayment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      amount: z.number().positive(),
      barCode: z.string(),
    });

    const { barCode, amount } = schema.parse(request.body);

    const createPaymentUseCase = makeCreatePaymentUseCase();

    const payment = await createPaymentUseCase.execute({
      userId: request.user.sub,
      barCode,
      amount,
    });

    return reply.status(200).send(payment);
  } catch (error) {
    throw new AppError(error);
  }
}
