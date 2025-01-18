import { AppError } from "@/use-cases/errors/app-error";
import { makeBackofficeAuthenticateUseCase } from "@/use-cases/factories/auth/make-backoffice-authenticate-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function backofficeAuthenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      email: z.string(),
      password: z.string().min(6),
    });

    const { email, password } = schema.parse(request.body);

    const backofficeAuthenticateUseCase = makeBackofficeAuthenticateUseCase();

    const { user } = await backofficeAuthenticateUseCase.execute({
      email,
      password,
    });

    const token = await reply.jwtSign(
      {
        role: user.role,
        type: user.access_token,
      },
      {
        sign: {
          sub: user.id,
          expiresIn: "30min",
        },
      },
    );

    return reply.status(200).send({
      user: { ...user, password: undefined },
      token,
    });
  } catch (error) {
    throw new AppError(error as Error);
  }
}
