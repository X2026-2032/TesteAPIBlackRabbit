import { prisma } from "@/lib/prisma";
import { AccountBalanceUseCase } from "../account-balance";
import { AppError } from "../errors/app-error";
import { getMaxNumberOfTransactionByGraphicAccountTransactions } from "@/utils";

interface DepositGrapicAccountUseCaseRequest {
  userId: string;
  amount: number;
  graphic_account_id: string;
}

export class DepositGrapicAccountUseCase {
  constructor() {}

  async execute(input: DepositGrapicAccountUseCaseRequest) {
    const [account, user] = await Promise.all([
      AccountBalanceUseCase.execute(input.userId),
      prisma.user.findUnique({ where: { id: input.userId } }),
    ]);

    if (!user) {
      throw new AppError({ message: "User not found" });
    }

    if (account.balance < input.amount) {
      throw new Error("Saldo insuficiente.");
    }

    const graphicAccount = await prisma.graphicAccount.findFirst({
      where: {
        id: input.graphic_account_id,
        account_id: account.id,
      },
    });

    if (!graphicAccount) {
      throw new Error("Conta gráfica não encontrada");
    }

    graphicAccount.balance += input.amount;

    await prisma.$transaction(async (tx) => {
      await tx.graphicAccount.update({
        where: {
          id: input.graphic_account_id,
        },
        data: { ...graphicAccount, phone: undefined },
      });
      const number_of_transaction =
        await getMaxNumberOfTransactionByGraphicAccountTransactions();
      await tx.graphicAccountTransaction.create({
        data: {
          amount: input.amount,
          data: {
            payer: {
              ...user,
              password: undefined,
            },
            beneficiary: {
              ...graphicAccount,
            },
          } as any,
          status: "done",
          direction: "out",
          type: "internal",
          graphic_account_id: input.graphic_account_id,
          description: "Deposito",
          number_of_transaction,
        },
      });
    });

    return { graphicAccount };
  }
}
