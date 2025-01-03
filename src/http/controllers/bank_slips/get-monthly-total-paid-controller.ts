import { FastifyRequest, FastifyReply } from "fastify";
import { bankSlipRepository } from "@/use-cases/factories/bank_slips/make-bank-slip-repository-factory";
import { AppError } from "@/use-cases/errors/app-error";

export async function getMonthlyTotalPaidByUserIdController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const params = request.params as { userId: string };
  const userId = params.userId;

  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const bankSlips = await bankSlipRepository.findByUserId(userId);
    const totalPaid = bankSlips
      .filter((bankSlip) => {
        const createdDate = new Date(bankSlip.created_at || "");
        return (
          createdDate.getMonth() + 1 === currentMonth &&
          createdDate.getFullYear() === currentYear
        );
      })
      .reduce((total, bankSlip) => total + bankSlip.amount, 0);

    reply.code(200).send({ totalPaid });
  } catch (error) {
    throw new AppError(error);
  }
}
