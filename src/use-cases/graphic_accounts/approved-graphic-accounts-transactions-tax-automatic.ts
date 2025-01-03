import { CreateTransactionUseCase } from "../transactions/create-transactions";
import { GetUsersAccountToken } from "../get-users-account-token";
import { IdezBankSlipsService } from "@/service/idez/bank-slips";
import { IdezBankTransfersService } from "@/service/idez/bank-transfers";
import { IdezPhoneRechargesService } from "@/service/idez/phone-recharges";
import { IdezPixService } from "@/service/idez/pix";
import { prisma } from "@/lib/prisma";

export class ApprovedTaxAutomaticGrapicAccountTransactionsUseCase {
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
          await this.processTransaction(transaction, graphicAccount);
        } catch (error) {
          console.error(
            `Erro ao processar transação automática: ${error.message}`,
          );
          // Trate o erro conforme necessário
        }
      }
    }
  }

  private static async processTransaction(
    transaction: any,
    graphicAccount: any,
  ) {
    const token = await GetUsersAccountToken.execute(graphicAccount.user_id);
    if (!token) throw new Error("Usuário inválido");

    const factory: Record<string, any> = {
      pix: new IdezPixService().transfers,
      ted: new IdezBankTransfersService().transfers,
      bank_slips: new IdezBankSlipsService().execute,
      payment: new CreateTransactionUseCase().execute,
      phone_recharges: new IdezPhoneRechargesService().confirm,
      p2p_transfer: new IdezBankTransfersService().p2pTransfer,
    };

    const process: Record<string, any> = {};

    process[transaction.id] = {
      process: "waiting",
      response: undefined,
      amount: transaction.amount,
      direction: transaction.direction,
      graphic_account_id: transaction.graphic_account_id,
    };

    try {
      const eTed = transaction.type === "ted" ? true : false;

      const idezBuild = {
        id_tx: transaction.id,
        pin: graphicAccount.pin, // Usando o PIN da conta gráfica
        ...(eTed
          ? {
              amount: transaction.data.amount,
              bank_account: {
                document: transaction.data.bank_account_document,
                bank: transaction.data.bank_account_bank,
                branch: transaction.data.bank_account_branch,
                account_number: transaction.data.bank_account_number,
                account_digit: transaction.data.bank_account_digit,
                name: transaction.data.bank_account_name,
              },
            }
          : (transaction.data as any)),
      };

      const response = await factory[transaction.type](
        idezBuild,
        token.access_token,
      );
      process[transaction.id].process = "done";
      process[transaction.id].response = response;
    } catch (error) {
      console.error(error);
      process[transaction.id] = {
        ...process[transaction.id],
        process: "error",
        response: {
          data: error.data,
          message: error.message,
        },
      };
    }

    const updateTransactions = Object.entries(process).reduce((acc, item) => {
      const [id, data] = item;

      acc.push({
        id,
        status: data.process,
        response: data.response,
      });

      return acc;
    }, [] as any);

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < updateTransactions.length; i++) {
        const transaction = updateTransactions[i];
        await tx.graphicAccountTransaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            ...transaction,
            id: undefined,
          },
        });
      }
    });
  }
}
