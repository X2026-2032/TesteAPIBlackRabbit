import { AppError } from "@/use-cases/errors/app-error";
import { makeRegisterPixKeyUseCase } from "@/use-cases/factories/make-register-pix-key-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function registerPixKey(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      user_id: z.string(),
      bank_account_id: z.string(),
      key: z.string(),
      key_type: z.string(),
    });

    const input = schema.parse(request.body);

    const registerPixKeyUseCase = makeRegisterPixKeyUseCase();

    const pix = await registerPixKeyUseCase.execute({
      userId: input.user_id,
      bank_account_id: input.bank_account_id,
      key: input.key,
      key_type: input.key_type,
    });

    return reply.status(200).send(pix);
  } catch (error) {
    throw new AppError(error);
  }
}
