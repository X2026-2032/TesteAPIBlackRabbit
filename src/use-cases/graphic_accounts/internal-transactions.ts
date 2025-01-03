import { api } from "@/lib/axios";
import { prisma } from "@/lib/prisma";
import { PerformTaxUseCase, TaxNames } from "@/use-cases/tax/performTax";
import { AppError } from "../errors/app-error";

type CreatePaymentInternalRequest = {
  graphicAccountId: string;
  virtual_account_sender: string;
  virtual_account_receiver: string;
  receiver_id: string;
  amount: number;
};

type CreatePaymentBetweenWalletsRequest = {
  virtual_account_sender: string;
  virtual_account_receiver: string;
  amount: number;
};

type CreatePaymentBetweenWalletsResponse = {
  data: {
    data: {
      payment_document_id: string;
      scheduled_at: string;
    };
  };
};

export class InternalTransactionsBetweenWalletUseCase {
  public async create(input: CreatePaymentInternalRequest): Promise<any> {
    try {
      const graphicAccountPayer = await prisma.graphicAccount.findUnique({
        where: {
          id: input.graphicAccountId,
        },
      });

      const graphicAccountReceived = await prisma.graphicAccount.findUnique({
        where: {
          id: input.receiver_id,
        },
      });

      if (!graphicAccountPayer || !graphicAccountReceived) {
        throw new AppError({
          message: "Graphic account not found",
        });
      }

      if (graphicAccountPayer.balance < input.amount / 100) {
        throw new AppError({ message: "Insufficient balance" });
      }

      const transaction = await this.sendPaymentBetweenVirtualAccounts({
        virtual_account_sender: input.virtual_account_sender,
        virtual_account_receiver: input.virtual_account_receiver,
        amount: input.amount,
      });

      const latestTransactionPayer =
        await prisma.graphicAccountTransaction.findFirst({
          orderBy: {
            created_at: "desc",
          },
          select: {
            number_of_transaction: true,
          },
        });

      const updatedGraphicAccountTransactionPayer =
        await prisma.graphicAccountTransaction.create({
          data: {
            data: {},
            status: "PENDING",
            graphic_account_id: graphicAccountPayer.id,
            amount: input.amount / 100,
            number_of_transaction: latestTransactionPayer?.number_of_transaction
              ? latestTransactionPayer.number_of_transaction + 1
              : 1,
            direction: "out",
            newValue: graphicAccountPayer.balance - input.amount / 100,
            previousValue: graphicAccountPayer.balance,
            type: "INTERNAL_WALLET_TRANSACTION",
            transaction_id: transaction.data.data.payment_document_id,
            user_id: graphicAccountPayer.user_id,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

      const updatedPayerAccount = await prisma.graphicAccount.update({
        where: {
          id: graphicAccountPayer.id,
        },
        data: {
          balance: graphicAccountPayer.balance - input.amount / 100,
        },
      });

      await prisma.reportBalance.create({
        data: {
          description: "Transferencia entre wallets",
          created_at: new Date(),
          amount: updatedPayerAccount.balance,
          graphic_transaction_id: updatedGraphicAccountTransactionPayer.id,
          graphic_account_id: updatedPayerAccount.id,
        },
      });

      const latestTransactionReceiver =
        await prisma.graphicAccountTransaction.findFirst({
          orderBy: {
            created_at: "desc",
          },
          select: {
            number_of_transaction: true,
          },
        });

      await prisma.graphicAccountTransaction.create({
        data: {
          data: {},
          status: "PENDING",
          graphic_account_id: graphicAccountReceived.id,
          amount: input.amount / 100,
          number_of_transaction:
            latestTransactionReceiver?.number_of_transaction
              ? latestTransactionReceiver.number_of_transaction + 1
              : 1,
          direction: "in",
          newValue: graphicAccountReceived.balance + input.amount / 100,
          previousValue: graphicAccountReceived.balance,
          type: "INTERNAL_WALLET_TRANSACTION",
          transaction_id: transaction.data.data.payment_document_id,
          user_id: graphicAccountReceived.user_id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // await PerformTaxUseCase.execute({
      //   taxType: TaxNames.TRANSFERÊNCIA_ENTRE_WALLET,
      //   transactionAmmount: Number(amount),
      //   createdAt: new Date(),
      //   number_of_transactions: number_of_transaction_payer,
      //   transactionId: transaction_id_payer,
      //   account_id: graphicAccountPayer.id,
      // });

      // await PerformTaxUseCase.execute({
      //   taxType: TaxNames.TRANSFERÊNCIA_ENTRE_WALLET,
      //   transactionAmmount: Number(amount),
      //   createdAt: new Date(),
      //   number_of_transactions: number_of_transaction_receiver,
      //   transactionId: transaction_id_receiver,
      //   account_id: graphicAccountReceived.id,
      // });

      return transaction;
    } catch (error) {
      console.error(error);
    }
  }

  private async sendPaymentBetweenVirtualAccounts(
    input: CreatePaymentBetweenWalletsRequest,
  ): Promise<CreatePaymentBetweenWalletsResponse> {
    try {
      return await api.post(
        "/banking/cashout/transfer",
        {
          amount: input.amount,
          to_virtual_account_id: input.virtual_account_receiver,
          virtual_account_id: input.virtual_account_sender,
        },
        {
          auth: {
            username: process.env.AUTH_USERNAME || "",
            password: process.env.AUTH_PASSWORD || "",
          },
        },
      );
    } catch (error: any) {
      throw new AppError({ message: "Falha ao processar a transação" });
    }
  }
}
