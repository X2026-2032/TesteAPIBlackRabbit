import { AppError } from "../errors/app-error";
import { requestError } from "@/lib/axios";
import { prisma } from "@/lib/prisma";
import { BankTransfersRepository } from "@/repositories/bank-transfers-repository";

interface GetByAccountBankTransferUseCaseRequest {
  id: string;
}

export class GetByAccountBankTransferUseCase {
  constructor(private repository: BankTransfersRepository) {}

  async execute(params: GetByAccountBankTransferUseCaseRequest) {
    try {
      const accounts = await prisma.graphicAccount.findMany({
        where: {
          account_id: params.id,
        },
        select: {
          id: true,
        },
      });
      const transactions = await prisma.graphicAccountTransaction.findMany({
        where: {
          graphic_account_id: {
            in: accounts.map((item) => item.id),
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });
      return {
        transactions: {
          data: transactions,
          per_page: 20,
          current_page: 1,
          total: transactions.length,
        },
      };
    } catch (err) {
      throw new AppError(requestError(err));
    }
  }
}
