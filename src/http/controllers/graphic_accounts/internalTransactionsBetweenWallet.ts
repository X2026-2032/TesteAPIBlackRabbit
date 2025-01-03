import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { z } from "zod";
import { InternalTransactionsBetweenWalletUseCase } from "@/use-cases/graphic_accounts/internal-transactions";

export async function internalTransactionsBetweenWallet(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      amount: z.number(),
      virtual_account_sender: z.string(),
      receiver_id: z.string(),
      virtual_account_receiver: z.string(),
    });

    const input = schema.parse(request.body);
    const graphicAccountId = request.user.sub;

    const usecaseResponse =
      await new InternalTransactionsBetweenWalletUseCase().create({
        graphicAccountId,
        ...input,
      });

    reply.status(200).send(usecaseResponse.data);
  } catch (error: any) {
    console.error(error);
    reply.status(500).send(new AppError({ message: error.message }));
  }
}
