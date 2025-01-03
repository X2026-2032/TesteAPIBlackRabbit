import { api } from "@/lib/axios";
import { AppError } from "./errors/app-error";
import { prisma } from "@/lib/prisma";
import generateUUID from "@/utils/generateUUID";
import { getMaxNumberOfTransactionByAccountTransactions } from "@/utils";

type CreateBankTransferWithPixUseCaseRequest = {
  userId: string;
  data: {
    // pin: string;
    amount: number;
    description?: string;
    beneficiary: {
      number: string;
      type: string;
      branch: string;
      holder: {
        document: string;
        name: string;
        type: string;
      };
      participantIspb: string;
    };
    scheduled?: boolean;
    scheduleDate?: string;
  };
};

export class CreateBankTransferWithPixUseCase {
  async execute({ userId, data }: CreateBankTransferWithPixUseCaseRequest) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user)
      throw new AppError({ message: "Usuario não encontrado", status: 404 });

    const account = await prisma.account.findFirst({
      where: { user_id: user.id },
    });

    if (!account)
      throw new AppError({ message: "Conta não encontrada", status: 404 });

    await prisma.$transaction(async (tx) => {
      if (!data.scheduled) {
        const response = await api.post("/baas/api/v2/transfers", data, {
          headers: {
            "x-delbank-api-key": user.api_key,
            IdempotencyKey: generateUUID(),
          },
        });
        const number_of_transaction =
          await getMaxNumberOfTransactionByAccountTransactions();
        const createdTransaction = await tx.accountTransaction.create({
          data: {
            amount: data.amount,
            response: response.data,
            data: response.data,
            type: "TRANSFER_WITH_PIX",
            direction: "out",
            account_id: account.id,
            description: data.description,
            status: "done",
            previousValue: account.balance!,
            newValue: account.balance! - data.amount,
            number_of_transaction,
          },
        });

        const balance = account.balance || 0;

        await tx.reportBalance.create({
          data: {
            account_transaction_id: createdTransaction.id,
            account_id: account.id,
            description: data.description,
            amount: balance - data.amount,
          },
        });
      } else {
        const number_of_transaction =
          await getMaxNumberOfTransactionByAccountTransactions();
        const createdTransaction = await tx.accountTransaction.create({
          data: {
            amount: data.amount,
            type: "TRANSFER_WITH_PIX",
            direction: "out",
            account_id: account.id,
            description: data.description,
            scheduled: true,
            scheduled_at: new Date(data.scheduleDate!),
            previousValue: account.balance!,
            newValue: account.balance! - data.amount,
            beneficiary: data.beneficiary,
            apiKey: user.api_key,
            number_of_transaction,
          },
        });

        const balance = account.balance || 0;

        await tx.reportBalance.create({
          data: {
            account_transaction_id: createdTransaction.id,
            account_id: account.id,
            description: data.description,
            amount: balance - data.amount,
          },
        });
      }
    });
  }
}
