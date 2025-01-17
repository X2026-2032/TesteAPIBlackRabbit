import { UsersRepository } from "@/repositories/users-messenger-respository";
import { AppError } from "../errors/app-error";
import { prisma } from "@/lib/prisma";
import { AccountsRepository } from "@/repositories/accounts-repository";
import { getMaxNumberOfTransactionByGraphicAccountTransactions } from "@/utils";

interface WithdrawGrapicAccountUseCaseRequest {
  userId: string;
  graphic_account_id: string;
  amount: number;
}

export class WithdrawGrapicAccountUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private accountsRepository: AccountsRepository,
  ) {}

  async execute({
    userId,
    graphic_account_id,
    amount,
  }: WithdrawGrapicAccountUseCaseRequest) {
    const user = await this.usersRepository.findById(userId);

    if (!user) throw new AppError({ message: "User not found" });

    const graphicAccount = await prisma.graphicAccount.findFirst({
      where: {
        id: graphic_account_id,
        user_id: user?.id,
      },
    });

    if (!graphicAccount) {
      throw new AppError({
        code: "graphic.notfound",
        status: 400,
        message: "Conta não existe",
      });
    }

    if (graphicAccount.balance < amount) {
      throw new AppError({
        code: "graphic.insufficient_funds",
        status: 400,
        message: "Saldo insuficiente.",
      });
    }
    const _user = await prisma.user.findFirst({
      where: { id: graphicAccount.user_id },
    });
    const number_of_transaction =
      await getMaxNumberOfTransactionByGraphicAccountTransactions();

    graphicAccount.balance -= amount;
    await prisma.$transaction([
      prisma.graphicAccount.update({
        where: {
          id: graphicAccount.id,
        },
        data: { ...graphicAccount, phone: graphicAccount.phone || undefined },
      }),

      prisma.graphicAccountTransaction.create({
        data: {
          graphic_account_id: graphicAccount.id,
          type: "withdraw",
          data: {
            payer: graphicAccount,
            beneficiary: _user,
          } as any,
          direction: "in",
          amount,
          description: "Retirada pela conta pai",
          status: "done",
          previousValue: graphicAccount.balance,
          newValue: graphicAccount.balance + amount,
          number_of_transaction,
        },
      }),
    ]);

    return { graphicAccount: { ...graphicAccount, password_hash: undefined } };
  }
}
