import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { z } from "zod";
import { CreatePaymentPixUseCase } from "@/use-cases/pix/create-payment-pix-use-case";

export async function pixPaymentController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const schema = z.object({
      amount: z.number().min(1),
      key: z.string(),
    });

    const req = schema.parse(request.body);

    const userId = request.user.sub;

    const pixPayment = await new CreatePaymentPixUseCase().execute({
      ...req,
      user_id: userId,
    });

    return reply.status(200).send(pixPayment.data);
  } catch (error: any) {
    throw new AppError(error);
  }
}
