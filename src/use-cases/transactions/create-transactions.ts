import { prisma } from "@/lib/prisma";
import { IdezPixService } from "@/service/idez/pix";
import { AppError } from "../errors/app-error";
import { PerformTaxUseCase, TaxNames } from "../tax/performTax";
import { sendExtractImageToEmail } from "@/utils/makeExtractPDF";
import {
  getMaxNumberOfTransactionByAccountTransactions,
  getMaxNumberOfTransactionByGraphicAccountTransactions,
} from "@/utils";

export class CreateTransactionUseCase {
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
    const created_at = new Date();
    const graphic = await prisma.graphicAccount.findUnique({
      where: {
        id: userId,
      },
      include: {
        user: true,
      },
    });

    if (graphic) {
      const user = graphic.user;

      const userAccount = await prisma.account.findFirst({
        where: { user_id: user.id },
      });

      if (graphic.balance < data.amount && data.direction === "out") {
        throw new Error("Saldo insuficiente.");
      }
      const number_of_transaction =
        await getMaxNumberOfTransactionByGraphicAccountTransactions();
      const trx = await prisma.$transaction(
        async (tx) => {
          const _data = {
            ...data,
            graphic_account_id: graphic.id,
            endToEndPix: data.data.endToEndId || data.endToEndId || "",
            endToEndId: undefined,
            initiationType: undefined,
            userId: undefined,
            data: {},
            order_id: data.data.endToEndId || data.endToEndId || "",
            previousValue: graphic.balance,
            newValue:
              data.direction == "in"
                ? graphic.balance + data.amount
                : graphic.balance - data.amount,
            number_of_transaction,
            created_at,
          };

          const transaction = await tx.graphicAccountTransaction.create({
            data: _data,
          });

          if (userAccount && userAccount.balance && transaction) {
            await tx.reportBalance.create({
              data: {
                amount:
                  data.direction == "in"
                    ? graphic.balance + data.amount
                    : graphic.balance - data.amount,
                graphic_account_id: graphic.id,
                graphic_transaction_id: transaction.id,
                description: data.description,
              },
            });
          }

          if (data.direction === "out") {
            if (graphic.role == "WALLET" || graphic.status_pin_eletronic) {
              if (!transaction.endToEndPix)
                throw new AppError({
                  message: "transaction.endToEndPix nao foi encontrado",
                });

              const response = await new IdezPixService().transfers(
                {
                  amount: transaction.amount,
                  endToEndId: transaction.endToEndPix,
                  initiationType: "KEY",
                },
                graphic.virtual_account_id!,
              );

              if (!response) {
                throw new AppError({ message: "transaction error" });
              }

              await tx.graphicAccountTransaction.update({
                where: { id: transaction.id },
                data: {
                  response: response,
                  order_id: response?.endToEndId || undefined,
                },
              });

              await tx.graphicAccount.update({
                where: {
                  id: graphic.id,
                },
                data: {
                  balance: graphic.balance - data.amount,
                },
              });
            }

            await tx.graphicAccount.update({
              where: {
                id: graphic.id,
              },
              data: {
                balance: graphic.balance - data.amount,
              },
            });
          }
          return transaction;
        },
        { timeout: 20000 },
      );

      if (graphic.role == "WALLET" || graphic.status_pin_eletronic) {
        await PerformTaxUseCase.execute({
          account_id: graphic.id,
          taxType: TaxNames.TRANSFERÊNCIA_PIX_CHECKOUT,
          transactionAmmount: data.amount,
          number_of_transactions: number_of_transaction,
          createdAt: created_at,
        });

        sendExtractImageToEmail({
          name: graphic.name,
          to: graphic.email,
          transactionId: trx.id,
        });
      }
      return {
        transation: trx,
        graphic: true,
      };
    }

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
      number_of_transaction,
      account_id: account.account_id,
      endToEndId: undefined,
      initiationType: undefined,
      correlationId: undefined,
      userId: undefined,
      order_id: data.data.endToEndId || data.endToEndId || "",
      previousValue: account.Account.balance!,
      newValue:
        data.direction == "out"
          ? account.Account.balance! - data.amount
          : account.Account.balance! + data.amount,
      data: {},
    };

    try {
      const transation = await prisma.$transaction(
        async (tx) => {
          const transation = await tx.accountTransaction.create({
            data: _data,
          });
          return transation;
        },
        { timeout: 20000 },
      );
      if (account.Account.balance && transation) {
        await prisma.reportBalance.create({
          data: {
            amount:
              data.direction == "out"
                ? account.Account.balance! - data.amount
                : account.Account.balance! + data.amount,
            account_id: account.account_id,
            account_transaction_id: transation.id,
            description: data.description,
          },
        });
      }

      return { transation, graphic: false };
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
