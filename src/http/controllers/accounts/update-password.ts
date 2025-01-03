import { AppError } from "@/use-cases/errors/app-error";
import { makeUpdatePasswordUseCase } from "@/use-cases/factories/accounts/make-update-password-use-case";
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

export async function updatePasswordController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      reset_code: z.string(),
      password: z.string(),
      email: z.string(),
      pin: z.string(),
    });

    const { reset_code, password, email, pin } = schema.parse(request.body);

    const factory = makeUpdatePasswordUseCase();

    await factory.execute({
      reset_code,
      password,
      email,
      pin,
    });

    reply.code(200).send({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    throw new AppError(error as Error);
  }
}
