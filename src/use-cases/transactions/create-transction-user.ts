import { prisma } from "@/lib/prisma";
import { getMaxNumberOfTransactionByAccountTransactions } from "@/utils";

export class CreateTransactionUseCaseUser {
  public async execute(
    data: {
      data: any;
      type: string;
      direction: string;
      status: string;
      amount: number;
      description: string;
      endToEndId?: string;
    },
    userId: string,
  ) {
    data.data;

    const account = await prisma.accountUsers.findFirst({
      where: {
        user_id: userId,
      },
      include: {
        Account: true,
      },
    });
    if (!account) throw new Error("Conta não cadatrada");

    if (account.Account.balance! < data.amount && data.direction === "out") {
      throw new Error("Saldo insuficiente.");
    }

    const number_of_transaction =
      await getMaxNumberOfTransactionByAccountTransactions();
    const _data = {
      ...data,
      account_id: account.account_id,
      number_of_transaction,
      endToEndId: undefined,
      initiationType: undefined,
      correlationId: undefined,
      userId: undefined,
      previousValue: account.Account.balance!,
      newValue:
        data.direction == "out"
          ? account.Account.balance! - data.amount
          : account.Account.balance! + data.amount,
      data: {},
    };

    try {
      const transation = await prisma.$transaction(async (tx) => {
        const transation = await tx.accountTransaction.create({
          data: _data,
        });
        return transation;
      });

      await prisma.reportBalance.create({
        data: {
          account_id: account.account_id,
          account_transaction_id: transation.id,
          amount:
            data.direction == "out"
              ? account.Account.balance! - data.amount
              : account.Account.balance! + data.amount,
          description: data.description,
        },
      });
      return { transation, graphic: false };
    } catch (error) {
      console.log("aqui1", error);
    }
  }
}
