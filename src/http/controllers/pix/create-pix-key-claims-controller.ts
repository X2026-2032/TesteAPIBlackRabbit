import { FastifyRequest, FastifyReply } from "fastify";
import { makeCreatePixKeyClaimUseCase } from "@/use-cases/factories/pix/make-create-pix-key-claim-use-case";
import { z } from "zod";
import { AppError } from "@/use-cases/errors/app-error";

export async function createPixKeyClaimController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const schema = z.object({
      key: z.string(),
      keyType: z.string(),
    });

    const { key, keyType } = schema.parse(request.body);

    const response = await makeCreatePixKeyClaimUseCase().execute({
      data: { key, keyType },
      userId: request?.user?.sub,
    });
    return reply.status(200).send(response);
  } catch (error) {
    throw new AppError(error);
  }
}
