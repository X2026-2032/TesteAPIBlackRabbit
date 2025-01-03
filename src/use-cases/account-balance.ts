import { prisma } from "@/lib/prisma";

export class AccountBalanceUseCase {
  static async execute(userId: string) {
    const account = await prisma.account.findFirst({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        balance: true,
      },
    });

    if (!account) {
      const errorMessage = `Erro: Conta não encontrada durante a execução de account-balance. Não foi encontrada uma conta associada ao usuário com ID ${userId} na tabela de accounts.`;
      console.error(errorMessage);
      throw new Error("Conta não encontrada account-balance");
    }

    const [balanceGraphic] = await prisma.graphicAccount.groupBy({
      by: ["user_id"],
      where: {
        user_id: userId,
      },
      _sum: {
        balance: true,
      },
    });

    if (balanceGraphic?._sum) {
      account.balance = account.balance! - balanceGraphic._sum.balance!;
    }

    return {
      id: account.id,
      balance: account.balance ?? 0,
    };
  }
}
