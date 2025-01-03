import { AppError } from "@/use-cases/errors/app-error";
import { CreatePaymentPixQrCodeUseCase } from "@/use-cases/pix/create-payment-qrcode-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function pixPaymentQrCodeController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      amount: z.number().min(1),
      qr_code_id: z.string(),
    });

    const req = schema.parse(request.body);

    const userId = request.user.sub;

    const pixPaymentQrCode = await new CreatePaymentPixQrCodeUseCase().execute({
      ...req,
      user_id: userId,
    });

    return reply.status(200).send(pixPaymentQrCode.data);
  } catch (error: any) {
    throw new AppError(error);
  }
}
