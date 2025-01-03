import { AppError } from "@/use-cases/errors/app-error";
import { makeCreateP2pTransferUseCase } from "@/use-cases/factories/make-create-p2p-transfer-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createP2pTaxTransfers(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      payee_id: z.string(),
      amount: z.number().positive(),
      endToEndId: z.string().optional(),
      description: z.string().optional(),
    });

    const { amount, payee_id, description, endToEndId } = schema.parse(
      request.body,
    );

    const createP2PTransfer = makeCreateP2pTransferUseCase();

    const transfers = await createP2PTransfer.execute({
      userId: request.user.sub,
      amount,
      payee_id,
      description,
      endToEndId,
    });

    return reply.status(200).send(transfers);
  } catch (error) {
    throw new AppError(error);
  }
}
