import { ResetPasswordRequest } from "@/repositories/password-reset-repository";
import { AppError } from "@/use-cases/errors/app-error";
import { createPasswordResetUseCase } from "@/use-cases/factories/accounts/make-password-reset-use-case";
import { FastifyRequest, FastifyReply } from "fastify";

export async function passwordResetController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { email } = request.body as ResetPasswordRequest;
    const factory = createPasswordResetUseCase();
    await factory.execute({ email });

    reply.code(200).send({
      message: "Código de redefinição enviado com sucesso para o seu e-mail",
    });
  } catch (error) {
    throw new AppError(error as Error);
  }
}
