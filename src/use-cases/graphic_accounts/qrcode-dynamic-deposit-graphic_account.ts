import { UsersRepository } from "@/repositories/users-respository";
import { prisma } from "@/lib/prisma";
import { AccountsRepository } from "@/repositories/accounts-repository";
import { getMaxNumberOfTransactionByGraphicAccountTransactions } from "@/utils";

interface DepositGrapicAccountUseCaseRequest {
  userId: string;
  amount: number;
  graphic_account_id: string;
}

export class DepositGrapicAccountByQrCodeUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private accountsRepository: AccountsRepository,
  ) {}

  async execute({
    userId,
    amount,
    graphic_account_id,
  }: DepositGrapicAccountUseCaseRequest) {
    const parentAccount = await prisma.account.findFirst({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        balance: true,
      },
    });

    if (!parentAccount) {
      throw new Error("Conta pai não encontrada");
    }

    if (parentAccount.balance === null || parentAccount.balance < amount) {
      throw new Error("Saldo insuficiente na conta pai.");
    }

    const graphicAccount = await prisma.graphicAccount.findFirst({
      where: {
        id: graphic_account_id,
        account_id: parentAccount.id,
      },
      select: {
        balance: true,
      },
    });

    if (!graphicAccount) {
      throw new Error("Conta gráfica não encontrada");
    }

    const updatedParentBalance = parentAccount.balance - amount;
    const updatedGraphicBalance = graphicAccount.balance + amount;

    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: {
          id: parentAccount.id,
        },
        data: {
          balance: updatedParentBalance,
        },
      });

      await tx.graphicAccount.update({
        where: {
          id: graphic_account_id,
        },
        data: {
          balance: updatedGraphicBalance,
        },
      });
      const number_of_transaction =
        await getMaxNumberOfTransactionByGraphicAccountTransactions();
      await tx.graphicAccountTransaction.create({
        data: {
          amount,
          data: {},
          status: "done",
          direction: "in",
          type: "internal",
          graphic_account_id,
          description: "Recarga via wallet",
          number_of_transaction,
        },
      });
    });

    return { graphicAccount };
  }
}
