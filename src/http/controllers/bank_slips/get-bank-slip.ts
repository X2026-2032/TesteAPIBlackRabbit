import { PrismaBankSlipRepository } from "@/repositories/prisma/prisma-bank-slip-repository";
import { AppError } from "@/use-cases/errors/app-error";
import { makeGetSlipUseCase } from "@/use-cases/factories/bank_slips/make-get-slip";
import { FastifyReply, FastifyRequest } from "fastify";

const repository = new PrismaBankSlipRepository();
const getSlipUseCase = makeGetSlipUseCase(repository);

export async function getBankSlipById(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id } = request.params as { id: string };

    const { bankSlip } = await getSlipUseCase.execute({ id });

    return reply.send({ bankSlip });
  } catch (error) {
    throw new AppError(error);
  }
}
