import { api, requestError } from "@/lib/axios";
import { UsersRepository } from "@/repositories/users-respository";
import { AppError } from "./errors/app-error";
import { prisma } from "@/lib/prisma";
import { CreateTransactionUseCase } from "./transactions/create-transactions";
import { GetUsersAccountToken } from "./get-users-account-token";
import { IdezPaymentsService } from "@/service/idez/payments";
import { UpdateTransactionsUseCase } from "./transactions/update-transactions";

interface CreateBankTransferUseCaseRequest {
  userId: string;
  barCode: string;
  amount: number;
}

export class CreatePaymentUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId, barCode, amount }: CreateBankTransferUseCaseRequest) {
    const data = {
      amount,
      barcode: barCode,
      direction: "out",
    };
    const buildPayment = {
      amount,
      type: "payment",
      direction: "out",
      status: "waiting",
      data: {
        ...data,
        pin: undefined,
      },
      description: barCode,
    };
    const payment = await new CreateTransactionUseCase().execute(
      buildPayment,
      userId,
    );

    const user = await prisma.user.findFirst({ where: { id: userId } });

    if (!user || !user?.api_key)
      throw new AppError({ message: "User or api-key not found" });

    if (payment && !payment.graphic) {
      const token = await GetUsersAccountToken.execute(userId);
      if (!token) throw new Error("Usuário inválido");

      try {
        const response = await new IdezPaymentsService().create(
          data,
          user.api_key,
        );
        await prisma.$transaction(async (tx) => {
          const account = await tx.account.findUnique({
            where: {
              id: token.account_id,
            },
          });
          if (!account) throw new Error("Erro para atualizar saldo");

          const balance = account.balance! - amount;
          await tx.account.update({
            where: {
              id: account.id,
            },
            data: {
              balance,
            },
          });
        });
        await new UpdateTransactionsUseCase().execute(
          response,
          payment.transation.id,
          false,
        );
      } catch (error) {
        await new UpdateTransactionsUseCase().execute(
          undefined,
          payment.transation.id,
          false,
          "error",
        );
        throw error;
      }
    }

    return { payment };
  }
}
