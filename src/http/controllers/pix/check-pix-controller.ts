import { AppError } from "@/use-cases/errors/app-error";
import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { CheckPixKeyUseCase } from "@/use-cases/pix/check-pix-key-use-case";

export async function checkPixController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      key: z.string(),
    });

    const req = schema.parse(request.body);

    const checkPixResponse = await new CheckPixKeyUseCase().execute({
      userId: request.user.sub,
      key: req.key,
    });

    return reply.status(200).send(checkPixResponse);
  } catch (error: any) {
    throw new AppError(error);
  }
}
