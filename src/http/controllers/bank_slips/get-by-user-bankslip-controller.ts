import { AppError } from "@/use-cases/errors/app-error";
import { makeGetSlipsByUserController } from "@/use-cases/factories/bank_slips/make-getall-slip-by-user-factory";
import { FastifyReply, FastifyRequest } from "fastify";

export async function getByUserBankSlipController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { userId } = request.params as { userId: string };

    const factory = makeGetSlipsByUserController();
    const result = await factory.execute({ userId });

    reply.send(result);
  } catch (error: any) {
    throw new AppError(error);
  }
}
