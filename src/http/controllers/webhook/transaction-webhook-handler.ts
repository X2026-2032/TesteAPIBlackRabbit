import notificationsEmitter from "@/handlers/notificationEventsEmitter";
import { prisma } from "@/lib/prisma";
import { getMaxNumberOfTransactionByGraphicAccountTransactions } from "@/utils";
import { stringToNumber } from "@/utils/string-to-number";

export class WebhookHandler {
  static async handleTransaction(data: any) {
    try {
      const method = data.method;
      const idIdTxTx = data.correlationId;
      const amountForGraphicAccount = data.amount;

      if (data?.direction === "in" && data?.method === "dynamic_qr") {
        const qrCodeData = await prisma.qrCode.findFirst({
          where: {
            response_tx_id: idIdTxTx,
          },
        });

        if (!qrCodeData) {
          console.error(
            "Não foi encontrada nenhuma transação com o ID fornecido.",
          );
          return;
        }

        const userId = qrCodeData.userId;

        const graphicAccount = await prisma.graphicAccount.findFirst({
          where: {
            AND: [
              { id: qrCodeData.userId }, // Comparando id da tabela GraphicAccount com userId da tabela QrCode
            ],
          },
        });

        if (!graphicAccount) {
          console.error("Conta gráfica não encontrada para o usuário.");
          await this.updateStatus(
            "Conta gráfica não encontrada para o usuário",
          );
          return;
        }

        const account = await prisma.account.findFirst({
          where: {
            AND: [
              { id: graphicAccount.account_id },
              { user_id: graphicAccount.user_id },
            ],
          },
        });

        if (!account) {
          console.error("Conta pai não encontrada para o usuário.");
          await this.updateStatus("Conta pai não encontrada para o usuário");
          return;
        }

        if (
          account.balance === null ||
          account.balance < amountForGraphicAccount
        ) {
          console.error("Saldo insuficiente na conta pai.");
          await this.updateStatus("Saldo insuficiente na conta pai");
          return;
        }

        console.log(
          "Saldo atual da conta gráfica antes do depósito:",
          graphicAccount.balance,
        );
        console.log(
          "Valor a ser depositado na conta gráfica:",
          amountForGraphicAccount,
        );

        const balance = graphicAccount.balance;
        const balanceAsNumber = stringToNumber(balance.toString());
        const amountAsNumber = parseFloat(amountForGraphicAccount);
        const updatedBalance = balanceAsNumber + amountAsNumber;

        console.log("Novo saldo calculado após o depósito:", updatedBalance);

        await prisma.graphicAccount.update({
          where: {
            id: graphicAccount.id,
          },
          data: {
            balance: updatedBalance,
          },
        });

        console.log(
          "Saldo atualizado com sucesso na conta gráfica:",
          graphicAccount.id,
        );

        const number_of_transaction =
          await getMaxNumberOfTransactionByGraphicAccountTransactions();
        const transaction = await prisma.graphicAccountTransaction.create({
          data: {
            amount: amountAsNumber,
            data: {},
            status: "done",
            direction: "in",
            type: "auto_deposit",
            graphic_account_id: graphicAccount.id,
            description: "Depósito automático",
            number_of_transaction,
          },
        });

        const notificationData = {
          title: "Pix recebido",
          message: `Você recebeu um pix de ${amountAsNumber} reais`,
          graphicAccountId: graphicAccount.id,
          schema: "graphicAccountTransaction",
          schema_id: transaction.id,
        };

        notificationsEmitter.criarNotificacao(notificationData);

        const parentAccount = await prisma.account.findFirst({
          where: {
            id: graphicAccount.account_id, // ID da conta pai relacionada à conta gráfica
          },
        });

        if (!parentAccount) {
          console.error("Conta pai não encontrada para a conta gráfica.");
          return;
        }

        const updatedParentBalance =
          (account.balance as number) - amountAsNumber;

        const balancet = account.balance! - data.amount;

        await prisma.account.update({
          where: {
            id: account.id,
          },
          data: {
            balance: balancet,
          },
        });

        const message = "Completed";
        await prisma.qrCode.update({
          where: {
            id: qrCodeData.id,
          },
          data: {
            status: message,
          },
        });
      } else {
        console.error("Condições não atendidas para processar a transação.");
        await this.updateStatus(
          "Condições não atendidas para processar a transação",
        );
      }
    } catch (error) {
      console.error("Ocorreu um erro ao lidar com a transação:", error);
    }
  }

  static async updateStatus(statusMessage: string) {
    const fullErrorMessage = `${statusMessage}`;
    await prisma.qrCode.updateMany({
      where: {},
      data: {
        status: fullErrorMessage,
      },
    });
    console.log("Status atualizado:", fullErrorMessage);
  }
}
