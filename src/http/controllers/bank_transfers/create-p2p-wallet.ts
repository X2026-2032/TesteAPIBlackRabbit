import { CreateP2pTransferWallet } from "@/use-cases/create-p2p-wallet-transfer";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createP2pWallet(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      payee_id: z.string(),
      amount: z.number().positive(),
      description: z.string().optional(),
    });

    const { amount, payee_id, description } = schema.parse(request.body);

    const createP2pTransferUseCase = new CreateP2pTransferWallet();

    const transfers = await createP2pTransferUseCase.execute({
      userId: request.user.sub,
      amount,
      payee_id,
      description,
    });

    return reply.status(200).send(transfers);
  } catch (error) {
    console.log("error:", error);
    throw new AppError(error as any);
  }
}
