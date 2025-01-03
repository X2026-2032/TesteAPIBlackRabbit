import { AppError } from "@/use-cases/errors/app-error";
import { makeCreateP2pTransferUseCase } from "@/use-cases/factories/make-create-p2p-transfer-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createP2pTransfers(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      payee_id: z.string(),
      amount: z.number().positive(),
      description: z.string().optional(),
      // external_id: z.string(),
    });

    const { amount, payee_id, description } = schema.parse(request.body);

    const createP2pTransferUseCase = makeCreateP2pTransferUseCase();

    const transfers = await createP2pTransferUseCase.execute({
      userId: request.user.sub,
      amount,
      payee_id,
      description,
    });

    return reply.status(200).send(transfers);
  } catch (error: any) {
    console.error("error:", error);
    throw new AppError(error);
  }
}
