import { AppError } from "@/use-cases/errors/app-error";
import { makeValidatePaymentUseCase } from "@/use-cases/factories/make-validate-payment-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function validatePayment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      barCode: z.string(),
    });

    const { barCode } = schema.parse(request.body);

    const validatePaymentUseCase = makeValidatePaymentUseCase();

    const payment = await validatePaymentUseCase.execute({
      userId: request.user.sub,
      barCode,
    });

    return reply.status(200).send(payment);
  } catch (error) {
    throw new AppError(error);
  }
}
