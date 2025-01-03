import notificationsEmitter from "@/handlers/notificationEventsEmitter";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { PerformTaxUseCase, TaxNames } from "@/use-cases/tax/performTax";
import {
  getMaxNumberOfTransactionByAccountTransactions,
  getMaxNumberOfTransactionByGraphicAccountTransactions,
} from "@/utils";
import generateUUID from "@/utils/generateUUID";
import { io } from "@/app";
import { PayInRequest } from "@/http/controllers/pix/handle-delbank-charge-webhook";

export default class DelbankWebhookUseCase {
  public static async chargePaid(data: PayInRequest) {
    const [transaction, graphicTransaction, qrCode] = await Promise.all([
      prisma.accountTransaction.findFirst({
        where: { idempotency_id: data.data.external_id },
      }),
      prisma.graphicAccountTransaction.findFirst({
        where: { idempotency_id: data.data.external_id },
      }),
      prisma.qrCode.findFirst({
        where: { idempotency_id: data.data.external_id },
      }),
    ]);

    const copyAndPasteExists = await prisma.graphicAccountTransaction.findFirst(
      {
        where: {
          status: "PENDING",
          type: "PIX_COPY_AND_PASTE",
          end_to_end_id: data.data.end_to_end_id,
        },
      },
    );

    if (copyAndPasteExists) {
      const latestTransaction =
        await prisma.graphicAccountTransaction.findFirst({
          orderBy: {
            created_at: "desc",
          },
          select: {
            number_of_transaction: true,
          },
        });

      const graphic = await prisma.graphicAccount.findUnique({
        where: {
          id: copyAndPasteExists.graphic_account_id!,
        },
      });

      const newData = {
        ...data,
        user: {
          name: graphic?.name,
          document: graphic?.document,
          number_identifier: graphic?.number_identifier,
        },
      };

      const createdTransaction = await prisma.graphicAccountTransaction.create({
        data: {
          status: "done",
          transaction_id: copyAndPasteExists.transaction_id,
          graphic_account_id: copyAndPasteExists.graphic_account_id,
          response: data,
          amount: data.data.amount.amount / 100,
          direction: "out",
          data: newData,
          created_at: data.data.transaction_date,
          type: "PIX_COPY_AND_PASTE",
          previousValue: copyAndPasteExists.previousValue,
          newValue: copyAndPasteExists.newValue,
          number_of_transaction: latestTransaction?.number_of_transaction
            ? latestTransaction.number_of_transaction + 1
            : 1,
          end_to_end_id: data.data.end_to_end_id,
          payer_bank_name: data.data.counterparty.name,
          payer_document: data.data.counterparty.tax_number,
          payer_bank_account:
            data.data.counterparty_bank_account.account_number,
          user_id: copyAndPasteExists.user_id,
          description: "Qr Code Pago",
        },
      });

      await prisma.reportBalance.create({
        data: {
          description: "Pix copia e cola",
          graphic_transaction_id: createdTransaction.id,
          graphic_account_id: createdTransaction.graphic_account_id,
          amount: copyAndPasteExists.newValue,
          created_at: createdTransaction.created_at,
        },
      });

      return;
    }

    if (qrCode) {
      const graphicAccount = await prisma.graphicAccount.findFirst({
        where: { id: qrCode.userId },
      });
      // INICIO DA CONCILIACAO
      if (graphicTransaction) {
        let updatedGraphicAccountTransaction = null;
        if (qrCode?.type == "PIX_STATIC") {
          const number_of_transaction =
            await getMaxNumberOfTransactionByGraphicAccountTransactions();

          const fiveMinutes = new Date(Date.now() - 300 * 1000);

          const existingTransaction =
            await prisma.graphicAccountTransaction.findFirst({
              where: {
                amount: data.data.amount.amount / 100,
                order_id: data.data.end_to_end_id,
                created_at: {
                  gte: fiveMinutes,
                },
              },
            });

          if (existingTransaction) {
            return;
          }

          const newData = {
            ...data,
            user: {
              name: graphicAccount?.name,
              document: graphicAccount?.document,
              number_identifier: graphicAccount?.number_identifier,
            },
          };

          updatedGraphicAccountTransaction =
            await prisma.graphicAccountTransaction.create({
              data: {
                ...graphicTransaction,
                description: "QR Code Recebido",
                transaction_id: data?.data.id,
                status: "done",
                response: data,
                created_at: data.timestamp,
                amount: data.data.amount.amount / 100,
                direction: "in",
                graphic_account_id: graphicTransaction.graphic_account_id,
                data: newData || {},
                id: undefined,
                end_to_end_id: data.data.end_to_end_id,
                previousValue: graphicAccount.balance || 0,
                newValue:
                  graphicAccount.balance + data.data.amount.amount / 100,
                number_of_transaction,
              },
            });

          notificationsEmitter.criarNotificacao({
            title: "QR Code Recebido",
            message: `Você recebeu um Pix de ${
              data.data.amount.amount / 100
            } reais`,
            graphicAccountId: graphicTransaction.graphic_account_id,
            schema: "graphicAccountTransaction",
            idSchema: updatedGraphicAccountTransaction.id,
          });
        } else {
          const newData = {
            ...data,
            user: {
              name: graphicAccount?.name,
              document: graphicAccount?.document,
              number_identifier: graphicAccount?.number_identifier,
            },
          };

          updatedGraphicAccountTransaction =
            await prisma.graphicAccountTransaction.update({
              where: { id: graphicTransaction.id },
              data: {
                description: "QR Code Recebido",
                transaction_id: data.data.id,
                status: "done",
                response: data,
                amount: data.data.amount.amount / 100,
                data: newData,
                created_at: data.timestamp,
                direction: "in",
                previousValue: graphicAccount?.balance || 0,
                newValue:
                  graphicAccount?.balance + data.data.amount.amount / 100,
                end_to_end_id: data.data.end_to_end_id,
              },
            });

          notificationsEmitter.criarNotificacao({
            title: "QR Code Recebido",
            message: `Você recebeu um Pix de ${
              data.data.amount.amount / 100
            } reais`,
            graphicAccountId: graphicTransaction.graphic_account_id,
            schema: "graphicAccountTransaction",
            idSchema: updatedGraphicAccountTransaction.id,
          });
        }

        const userDad = await prisma.user.findFirst({
          where: { id: graphicAccount?.user_id },
        });

        const accountDad = await prisma.account.findFirst({
          where: { user_id: userDad?.id },
        });

        if (accountDad && graphicAccount) {
          if (!(qrCode.type == "PIX_DYNAMIC" || qrCode.type == "PIX_STATIC")) {
            if (accountDad.balance! - data.data.amount.amount / 100 < 0) {
              throw new AppError({ message: "Saldo insuficiente" });
            }
          }

          const updatedGraphicAccount = await prisma.graphicAccount.update({
            where: {
              id: graphicAccount.id,
            },
            data: {
              balance: graphicAccount.balance + data.data.amount.amount / 100,
            },
          });

          await prisma.reportBalance.create({
            data: {
              graphic_transaction_id: updatedGraphicAccountTransaction.id,
              graphic_account_id: graphicTransaction.graphic_account_id,
              amount: updatedGraphicAccount.balance,
              created_at: data.timestamp,
              description: "QR Code pago",
            },
          });

          // await PerformTaxUseCase.execute({
          //   account_id: graphicAccount.id,
          //   taxType: TaxNames.TRANSFERÊNCIA_PIX_CHECKIN,
          //   transactionAmmount: data.data.amount.amount / 100,
          //   transactionId: data.data.id,
          //   createdAt: data.timestamp,
          //   number_of_transactions:
          //     updatedGraphicAccountTransaction.number_of_transaction!,
          // });

          const graphicBalanceAfterTax = await prisma.graphicAccount.findFirst({
            where: {
              id: updatedGraphicAccount.id,
            },
          });

          io.emit(`update-balance-${updatedGraphicAccount.id}`, {
            balance:
              graphicBalanceAfterTax?.balance || updatedGraphicAccount.balance,
            amount: data.data.amount.amount / 100,
          });
        }
      } else if (transaction) {
        let updatedTransaction = null;
        const fiveMinutes = new Date(Date.now() - 300 * 1000);

        const existingTransaction = await prisma.accountTransaction.findFirst({
          where: {
            amount: data.data.amount.amount / 100,
            end_to_end_id: data.data.end_to_end_id,
            created_at: {
              gte: fiveMinutes,
            },
          },
        });

        if (existingTransaction) {
          return;
        }

        const userAccount = await prisma.account.findFirst({
          where: {
            user_id: qrCode.userId,
          },
        });

        if (qrCode?.type == "PIX_STATIC") {
          const number_of_transaction =
            await getMaxNumberOfTransactionByAccountTransactions();

          updatedTransaction = await prisma.accountTransaction.create({
            data: {
              ...transaction,
              idempotency_id: data.data.external_id,
              payer_document: data.data.counterparty.tax_number,
              id: generateUUID(),
              created_at: data.timestamp,
              description: `QR Code pago`,
              status: "done",
              response: data,
              transaction_id: data.data.id,
              amount: data.data.amount.amount / 100,
              direction: "in",
              data: transaction.data || {},
              end_to_end_id: data.data.end_to_end_id,
              previousValue: userAccount?.balance || 0,
              newValue: userAccount.balance + data.data.amount.amount / 100,
              beneficiary: data.data.counterparty,
              number_of_transaction,
              account_id: userAccount.id,
            },
          });

          notificationsEmitter.criarNotificacao({
            title: `QR Code pago`,
            message: `Você recebeu um Pix de ${
              data.data.amount.amount / 100
            } reais`,
            accountId: transaction.account_id,
            schema: "accountTransaction",
            idSchema: updatedTransaction.id,
          });
        } else {
          updatedTransaction = await prisma.accountTransaction.update({
            where: { id: transaction.id },
            data: {
              payer_document: data.data.counterparty.tax_number,
              account_id: userAccount.id,
              description: `QR Code pago`,
              status: "done",
              response: data,
              amount: Number(data.data.amount.amount / 100),
              direction: "in",
              previousValue: userAccount?.balance || 0,
              newValue: userAccount?.balance + data.data.amount.amount / 100,
              beneficiary: data.data.counterparty,
            },
          });

          notificationsEmitter.criarNotificacao({
            title: `QR Code pago`,
            message: `Você recebeu um Pix de ${
              data.data.amount.amount / 100
            } reais`,
            accountId: transaction.account_id,
            schema: "accountTransaction",
            idSchema: updatedTransaction.id,
          });
        }

        if (userAccount) {
          const updatedAccount = await prisma.account.update({
            where: {
              id: transaction.account_id,
            },
            data: {
              balance: userAccount.balance + data.data.amount.amount / 100,
            },
          });

          await prisma.reportBalance.create({
            data: {
              description: "QR Code pago",
              created_at: data.timestamp,
              amount: updatedAccount.balance ? updatedAccount.balance : 0,
              account_transaction_id: updatedTransaction.id,
              account_id: updatedAccount.id,
            },
          });

          // await PerformTaxUseCase.execute({
          //   taxType: TaxNames.TRANSFERÊNCIA_PIX_CHECKIN,
          //   transactionAmmount: Number(updatedTransaction.amount),
          //   createdAt: data.timestamp,
          //   number_of_transactions: updatedTransaction.number_of_transaction!,
          //   transactionId: transaction.id,
          //   account_id: userAccount.id,
          // });

          const balanceAfterTax = await prisma.account.findFirst({
            where: {
              id: updatedAccount.id,
            },
          });

          io.emit(`update-balance-${userAccount.id}`, {
            balance: balanceAfterTax!.balance,
            amount: data.data.amount.amount / 100,
          });
        }
      }
    }
  }

  public static async pixCashout(data: PayInRequest) {
    try {
      const [existsTransaction, existsGraphicTransaction] = await Promise.all([
        prisma.accountTransaction.findFirst({
          where: { end_to_end_id: data.data.end_to_end_id, status: "done" },
        }),
        await prisma.graphicAccountTransaction.findFirst({
          where: { end_to_end_id: data.data.end_to_end_id, status: "done" },
        }),
      ]);

      if (existsTransaction || existsGraphicTransaction) {
        return;
      }

      const [transactionPending, graphicTransactionPending] = await Promise.all(
        [
          prisma.accountTransaction.findFirst({
            where: {
              end_to_end_id: data.data.end_to_end_id,
              status: "PENDING",
            },
          }),
          await prisma.graphicAccountTransaction.findFirst({
            where: {
              end_to_end_id: data.data.end_to_end_id,
              status: "PENDING",
            },
          }),
        ],
      );

      if (!transactionPending && !graphicTransactionPending) {
        return;
      }

      const user = await prisma.user.findUnique({
        where: {
          id: transactionPending
            ? transactionPending.account_id!
            : graphicTransactionPending!.user_id!,
        },
      });

      if (!user) {
        throw new AppError({ message: "User not found" });
      }

      const account = await prisma.account.findFirst({
        where: { user_id: user.id },
        include: { user: true },
      });

      if (!account) {
        throw new AppError({ message: "User not found 83" });
      }

      const latestTransaction =
        await prisma.graphicAccountTransaction.findFirst({
          orderBy: {
            created_at: "desc",
          },
          select: {
            number_of_transaction: true,
          },
        });

      const graphic = await prisma.graphicAccount.findUnique({
        where: {
          id: graphicTransactionPending!.graphic_account_id!,
        },
      });

      const newData = {
        ...data,
        user: {
          name: graphic?.name,
          document: graphic?.document,
          number_identifier: graphic?.number_identifier,
        },
      };

      const { createdTransaction } = await prisma.$transaction(async (tx) => {
        const createdTransaction = await tx.graphicAccountTransaction.create({
          data: {
            status: "done",
            transaction_id: graphicTransactionPending!.transaction_id!,
            graphic_account_id: graphicTransactionPending!.graphic_account_id!,
            response: data,
            amount: data.data.amount.amount / 100,
            direction: "out",
            data: newData,
            created_at: data.data.transaction_date,
            type: "PIX_MANUAL",
            previousValue: graphicTransactionPending!.previousValue!,
            newValue: graphicTransactionPending!.newValue!,
            number_of_transaction: latestTransaction?.number_of_transaction
              ? latestTransaction.number_of_transaction + 1
              : 1,
            end_to_end_id: data.data.end_to_end_id,
            payer_bank_name: data.data.counterparty.name,
            payer_document: data.data.counterparty.tax_number,
            payer_bank_account:
              data.data.counterparty_bank_account.account_number,
            user_id: graphicTransactionPending!.user_id!,
          },
        });

        return { createdTransaction };
      });

      try {
        await prisma.reportBalance.create({
          data: {
            graphic_transaction_id: createdTransaction.id,
            graphic_account_id: createdTransaction.graphic_account_id,
            amount: account.balance!,
            created_at: createdTransaction.created_at,
          },
        });
      } catch (error) {
        console.log(error);
      }

      const notificationData = {
        title: "Pix recebido",
        message: `Você recebeu um Pix de ${
          data.data.amount.amount / 100
        } reais`,
        accountId: account.id,
        schema: "accountTransaction",
      };

      await notificationsEmitter.criarNotificacao(notificationData);

      // await PerformTaxUseCase.execute({
      //   account_id: account.id,
      //   taxType: TaxNames.TRANSFERÊNCIA_PIX_CHECKIN,
      //   transactionAmmount: data.data.amount.amount / 100,
      //   transactionId: data.data.id,
      //   createdAt: createdTransaction.created_at,
      //   number_of_transactions: number_of_transaction,
      // });

      io.emit(`update-balance-${account?.id}`, {
        balance: account.balance,
        amount: data.data.amount.amount / 100,
      });

      return;
    } catch (error) {
      console.log(error);
    }
  }

  public static async updateTransactionEndToEnd(data: PayInRequest) {
    try {
      const transaction = await prisma.graphicAccountTransaction.findFirst({
        where: {
          transaction_id: data.ref_id,
        },
      });

      if (!transaction) {
        throw new AppError({ message: "Transaction not found" });
      }

      await prisma.graphicAccountTransaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          end_to_end_id: data.data.end_to_end_id,
        },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  public static async pixInternalPayer(data: PayInRequest) {
    try {
      const transaction = await prisma.graphicAccountTransaction.findFirst({
        where: {
          transaction_id: data.ref_id,
          type: "INTERNAL_WALLET_TRANSACTION",
          direction: "out",
        },
      });

      if (!transaction) {
        throw new AppError({ message: "Transaction not found" });
      }

      const latestTransaction =
        await prisma.graphicAccountTransaction.findFirst({
          orderBy: {
            created_at: "desc",
          },
          select: {
            number_of_transaction: true,
          },
        });

      const graphic = await prisma.graphicAccount.findUnique({
        where: {
          id: transaction!.graphic_account_id!,
        },
      });

      const newData = {
        ...data,
        user: {
          name: graphic?.name,
          document: graphic?.document,
          number_identifier: graphic?.number_identifier,
        },
      };

      await prisma.graphicAccountTransaction.create({
        data: {
          status: "done",
          transaction_id: data.data.id,
          graphic_account_id: transaction.graphic_account_id,
          response: data,
          amount: data.data.amount.amount / 100,
          direction: "out",
          data: newData,
          created_at: data.data.transaction_date,
          type: "INTERNAL_WALLET_TRANSACTION",
          previousValue: transaction.previousValue!,
          newValue: transaction.newValue!,
          number_of_transaction: latestTransaction?.number_of_transaction
            ? latestTransaction.number_of_transaction + 1
            : 1,
          end_to_end_id: data.data.end_to_end_id,
          payer_bank_name: data.data.counterparty.name,
          payer_document: data.data.counterparty.tax_number,
          payer_bank_account:
            data.data.counterparty_bank_account.account_number,
          user_id: transaction.user_id!,
          description: "Pix Interno Realizado",
        },
      });

      return;
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  public static async pixInternalReceiver(data: PayInRequest) {
    try {
      const transaction = await prisma.graphicAccountTransaction.findFirst({
        where: {
          transaction_id: data.data.ref_id,
          type: "INTERNAL_WALLET_TRANSACTION",
          direction: "in",
        },
      });

      if (!transaction) {
        throw new AppError({ message: "Transaction not found" });
      }

      const graphic_account = await prisma.graphicAccount.findUnique({
        where: {
          id: transaction.graphic_account_id!,
        },
      });

      if (!graphic_account) {
        throw new AppError({ message: "Graphic account not found" });
      }

      const latestTransaction =
        await prisma.graphicAccountTransaction.findFirst({
          orderBy: {
            created_at: "desc",
          },
          select: {
            number_of_transaction: true,
          },
        });

      const newData = {
        ...data,
        user: {
          name: graphic_account?.name,
          document: graphic_account?.document,
          number_identifier: graphic_account?.number_identifier,
        },
      };

      const updatedGraphicAccountTransaction =
        await prisma.graphicAccountTransaction.create({
          data: {
            status: "done",
            transaction_id: transaction.transaction_id,
            graphic_account_id: transaction.graphic_account_id,
            response: data,
            amount: data.data.amount.amount / 100,
            direction: "in",
            data: newData,
            created_at: data.data.transaction_date,
            type: "INTERNAL_WALLET_TRANSACTION",
            previousValue: transaction.previousValue!,
            newValue: transaction.newValue!,
            number_of_transaction: latestTransaction?.number_of_transaction
              ? latestTransaction.number_of_transaction + 1
              : 1,
            end_to_end_id: data.data.end_to_end_id,
            payer_bank_name: data.data.counterparty.name,
            payer_document: data.data.counterparty.tax_number,
            payer_bank_account:
              data.data.counterparty_bank_account.account_number,
            user_id: transaction.user_id!,
            description: "Pix Interno Recebido",
          },
        });

      const updatedGraphicAccount = await prisma.graphicAccount.update({
        where: {
          id: transaction.graphic_account_id!,
        },
        data: {
          balance: graphic_account.balance + data.data.amount.amount / 100,
        },
      });

      await prisma.reportBalance.create({
        data: {
          graphic_transaction_id: updatedGraphicAccountTransaction.id,
          graphic_account_id: graphic_account.id,
          amount: updatedGraphicAccount.balance,
          created_at: data.timestamp,
          description: "Pix Interno Recebido",
        },
      });

      io.emit(`update-balance-${graphic_account.id}`, {
        balance: updatedGraphicAccount.balance,
        amount: data.data.amount.amount / 100,
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }
}
