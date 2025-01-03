import { prisma } from "@/lib/prisma";

export class AccountBalanceQrCodeUseCase {
  static async execute(userId: string) {
    console.log(
      "Executando caso de uso para obter saldo da conta com o userId:",
      userId,
    );

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
      const errorMessage = `Erro: Conta não encontrada durante a execução de account-balance do qrCode Rudival eu to aqui. Não foi encontrada uma conta associada ao usuário com ID ${userId} na tabela de accounts.`;
      console.error(errorMessage);
      throw new Error("Conta não encontrada account-balance");
    }

    console.log(
      "Saldo da conta recuperado com sucesso para o usuário com ID:",
      userId,
      "e saldo:",
      account.balance,
    );

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
      console.log(
        "Saldo gráfico encontrado para o usuário com ID:",
        userId,
        "e saldo:",
        balanceGraphic._sum.balance,
      );
    } else {
      console.log(
        "Nenhum saldo gráfico encontrado para o usuário com ID:",
        userId,
      );
    }

    console.log(
      "Saldo final calculado com sucesso para o usuário com ID:",
      userId,
      "e saldo final:",
      account.balance,
    );

    return {
      id: account.id,
      balance: account.balance ?? 0,
    };
  }
}
