import { AppError } from "@/use-cases/errors/app-error";
import { makeQrCodePixStaticUseCase } from "@/use-cases/factories/make-qrCode-pix-static-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createQRCodeStaticController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      amount: z.number(),
      description: z.string(),
      options: z.object({
        show_qrcode_image: z.boolean(),
      }),
      virtual_account_id: z.string(),
    });

    const req = schema.parse(request.body);

    const registerPixQrCodeStaticUseCase = makeQrCodePixStaticUseCase();

    const pix = await registerPixQrCodeStaticUseCase.execute({
      userId: request.user.sub,
      amount: req.amount,
      description: req.description,
      options: req.options,
      virtual_account_id: req.virtual_account_id,
    });

    return reply.status(200).send(pix);
  } catch (error: any) {
    throw new AppError(error);
  }
}
