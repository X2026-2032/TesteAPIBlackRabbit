import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetByAccountBankTransferUseCase } from "@/use-cases/factories/bank_transfers/make-get-by-account-bank-transfer-use-case";
import { AppError } from "@/use-cases/errors/app-error";

export async function getByUserBankTransferController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as any;
    const factory = makeGetByAccountBankTransferUseCase();
    const result = await factory.execute({ id });
    return reply.status(200).send(result);
  } catch (error: any) {
    throw new AppError(error);
  }
}
