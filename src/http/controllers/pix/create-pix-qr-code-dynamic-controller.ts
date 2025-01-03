import { AppError } from "@/use-cases/errors/app-error";
import { makeQrCodePixDynamicUseCase } from "@/use-cases/factories/make-qrCode-pix-dynamic-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import {
  CounterPartyType,
  QrCodeOptions,
} from "@/use-cases/pix/create-pix-qr-code-dynamic-use-case";

interface PixQrCodeDynamicCaseRequest {
  userId: string;
  description: string;
  amount: number;
  counterparty: CounterPartyType;
  date_expiration?: string;
  options: QrCodeOptions;
  virtual_account_id: string;
}

export async function createQRCodeDynamicController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      amount: z.number().min(0),
      date_expiration: z.string().optional(),
      counterparty: z.object({
        name: z.string(),
        tax_number: z.string(),
      }),
      description: z.string(),
      options: z.object({
        allow_change_the_amount_on_payment: z.boolean(),
        show_qrcode_image: z.boolean(),
      }),
      virtual_account_id: z.string(),
    });

    const validatedBody = schema.parse(request.body);

    const pixQrCodeDynamicCaseRequest: PixQrCodeDynamicCaseRequest = {
      userId: request.user.sub,
      amount: validatedBody.amount,
      date_expiration: validatedBody.date_expiration,
      counterparty: validatedBody.counterparty,
      description: validatedBody.description,
      options: validatedBody.options,
      virtual_account_id: validatedBody.virtual_account_id,
    };

    const registerPixQrCodeDynamicUseCase = makeQrCodePixDynamicUseCase();

    const pix = await registerPixQrCodeDynamicUseCase.execute(
      pixQrCodeDynamicCaseRequest,
    );

    return reply.status(200).send(pix);
  } catch (error: any) {
    throw new AppError(error);
  }
}
