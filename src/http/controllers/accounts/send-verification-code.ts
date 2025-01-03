import { AppError } from "@/use-cases/errors/app-error";
import { makeSendVerificationCodeUseCase } from "@/use-cases/factories/make-send-verification-code-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function sendVerificationCode(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const options = [
      "pix.email",
      "pix.phone",
      "sms",
      "credit",
      "email",
      "loan",
      "password",
      "pin",
    ] as const;
    const schema = z.object({
      type: z.enum(options),
    });

    const { type } = schema.parse(request.body);

    const sendVerificationCodeUseCase = makeSendVerificationCodeUseCase();

    const pix = await sendVerificationCodeUseCase.execute({
      userId: request.user.sub,
      type,
    });

    return reply.status(200).send(pix);
  } catch (error) {
    throw new AppError(error);
  }
}
