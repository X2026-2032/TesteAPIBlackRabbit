import { AppError } from "@/use-cases/errors/app-error";
import { makeConfirmPixKeyUseCase } from "@/use-cases/factories/make-confirm-pix-key-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function confirmPixKey(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const schema = z.object({
    id: z.string(),
    user_id: z.string(),
    token: z.string(),
  });

  try {
    const { id, user_id, token } = schema.parse(request.body);

    const confirmPixKeyUseCase = makeConfirmPixKeyUseCase();

    const pix = await confirmPixKeyUseCase.execute({
      userId: user_id,
      id,
      token,
    });

    return reply.status(200).send(pix);
  } catch (error: any) {
    throw new AppError(error);
  }
}
