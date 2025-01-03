import { prisma } from "@/lib/prisma";

export class AutomaticGraphicAccountTransactionsService {
  public static async processPendingTransactions() {
    const graphicAccounts = await prisma.graphicAccount.findMany({
      where: {
        status_pin_eletronic: true,
      },
    });

    for (const graphicAccount of graphicAccounts) {
      const pendingTransactions =
        await prisma.graphicAccountTransaction.findMany({
          where: {
            status: "waiting",
            graphic_account_id: graphicAccount.id,
          },
        });

      for (const transaction of pendingTransactions) {
        try {
          // Processar a transação automaticamente
          await this.processTransaction(transaction);
        } catch (error: any) {
          console.error(
            `Erro ao processar transação automática: ${error.message}`,
          );
          // Trate o erro conforme necessário
        }
      }
    }
  }

  private static async processTransaction(transaction: any) {
    // Lógica para processar a transação automaticamente aqui
    // Você pode acessar o PIN da transação como transaction.GraphicAccount?.pin

    // Exemplo: Aprovação automática da transação
    await prisma.$transaction(async (tx) => {
      await tx.graphicAccountTransaction.update({
        where: { id: transaction.id },
        data: { status: "approved" },
      });

      // Outras ações necessárias, como atualizar o saldo ou realizar operações adicionais
    });
  }
}
