import { prisma } from "@/lib/prisma";

export class DeniedGrapicAccountTransactionsUseCase {
  public async execute(
    userId: string,
    data: {
      graphic_account_id: string;
      data: string[];
    },
  ) {
    await prisma.$transaction(async (tx) => {
      const [transaction] = await tx.graphicAccountTransaction.groupBy({
        by: ["graphic_account_id"],
        where: {
          id: {
            in: data.data,
          },
          direction: "out",
          status: "waiting",
          graphic_account_id: data.graphic_account_id,
        },
        _sum: {
          amount: true,
        },
      });
      const graphicAccount = await tx.graphicAccount.findFirst({
        where: {
          user_id: userId,
          id: data.graphic_account_id,
        },
        select: {
          id: true,
          balance: true,
        },
      });
      if (!graphicAccount) throw new Error("Conta gráfica não encontrada");

      await tx.graphicAccountTransaction.updateMany({
        where: {
          id: {
            in: data.data,
          },
          graphic_account_id: graphicAccount.id,
        },
        data: {
          status: "denied",
        },
      });

      if (transaction?._sum.amount)
        await tx.graphicAccount.update({
          where: {
            id: graphicAccount.id,
          },
          data: {
            balance: graphicAccount.balance + transaction._sum.amount,
          },
        });
    });
  }
}
