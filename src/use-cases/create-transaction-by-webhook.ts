import { CreateTransactionUseCase } from "./transactions/create-transactions";
import { prisma } from "@/lib/prisma";

export class CreateTransactionByWebHookUseCase {
  static async ted(data: any) {
    const build = {
      data,
      type: "ted",
      status: "done",
      response: data,
      direction: "in",
      amount: data.amount,
      transaction_id: data.id,
      description: data.payer.name,
    };

    await CreateTransactionByWebHookUseCase.createTransaction(
      build,
      data.account_id,
    );
  }
  static async pix(data: any) {
    const build = {
      data,
      type: "pix",
      status: data.status,
      response: data,
      direction: "in",
      amount: data.amount,
      transaction_id: data.id,
      description: data.payer.name,
      idTx: data.id_tx,
      method_qr_code: data.method,
    };
    await CreateTransactionByWebHookUseCase.createTransaction(
      build,
      data.account_id,
    );
  }
  static async createTransaction(build: any, refId: string) {
    const isTransaction = await prisma.accountTransaction.count({
      where: {
        transaction_id: build.transaction_id,
      },
    });

    if (isTransaction) return;

    const account = await prisma.account.findFirst({
      where: {
        refId,
      },
    });

    if (!account)
      throw new Error("Conta não encontrada create transaction-by-web-hook");

    await new CreateTransactionUseCase().execute(build, account.user_id);

    await prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: {
          id: account.id,
        },
        data: {
          balance: account.balance + build.amount,
        },
      });
    });
  }
}
