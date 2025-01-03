import { AppError } from "@/use-cases/errors/app-error";
import { makeGetBalanceByReportBalanceUseCase } from "@/use-cases/factories/accounts/make-get-balance-by-report-balance";
import { FastifyReply, FastifyRequest } from "fastify";

export async function getBalanceByReportBalance(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.sub;

    const getBalanceByReportBalance = makeGetBalanceByReportBalanceUseCase();

    const { balance } = await getBalanceByReportBalance.execute({
      userId,
    });

    return reply.status(200).send(balance);
  } catch (error: any) {
    throw new AppError(error);
  }
}
