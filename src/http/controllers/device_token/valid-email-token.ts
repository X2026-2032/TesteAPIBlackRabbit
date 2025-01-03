import { getIdUser } from "@/http/middlewares/verify-device";
import { DeviceTokenRepository } from "@/repositories/prisma/prisma-device-token-repository";
import { ValidEmailTokenUseCase } from "@/use-cases/device_token/valid-email-token-usecase";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function validEmailToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const paramSchema = z.object({
      token: z.string(),
    });

    const data = paramSchema.parse(request.body);

    const user_id = await getIdUser(request);

    const validEmailTokenUseCase = new ValidEmailTokenUseCase(
      new DeviceTokenRepository(),
    );

    await validEmailTokenUseCase.execute(data.token, user_id);

    reply.code(204);
  } catch (error: any) {
    throw new AppError(error);
  }
}
