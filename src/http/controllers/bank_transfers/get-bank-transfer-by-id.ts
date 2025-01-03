import { FastifyReply, FastifyRequest } from "fastify";
import { makeFetchParams } from "@/utils/make-fetch-params";
import { makeFindAllBankTransfersUseCase } from "@/use-cases/factories/bank_transfers/make-find-all-bank-transfers-use-case";
import { AppError } from "@/use-cases/errors/app-error";

export async function findAllBankTransfer(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { params } = request;

    const query = request.query;
    const factory = makeFindAllBankTransfersUseCase();

    const result = await factory.execute(makeFetchParams(query));

    return reply.status(200).send(result);
  } catch (error: any) {
    throw new AppError(error);
  }
}
