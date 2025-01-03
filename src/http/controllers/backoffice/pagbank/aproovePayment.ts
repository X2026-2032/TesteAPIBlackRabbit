import { PagBankPaymentStatus } from "@/@types/types";
import notificationsEmitter from "@/handlers/notificationEventsEmitter";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import {
  getMaxNumberOfTransactionByAccountTransactions,
  getMaxNumberOfTransactionByGraphicAccountTransactions,
} from "@/utils";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function aproovePayment(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const adminId = request.user.sub;

    const bodySchema = z.object({
      machineIds: z.array(z.string()),
      startDate: z.string(),
      endDate: z.string(),
      description: z.string().optional().default(""),
      discount: z.number().optional().nullable(),
    });

    const { description, endDate, machineIds, startDate, discount } =
      bodySchema.parse(request.body);

    const startDateDate = new Date(startDate);

    const endDateDate = new Date(endDate);

    const machines = await prisma.pagBankCardMachine.findMany({
      where: { id: { in: machineIds } },
      include: {
        PagBankTransaction: {
          where: {
            created_at: {
              gte: startDateDate,
              lte: endDateDate,
            },
            OR: [
              {
                isAwaitingTransfer: true,
                status: PagBankPaymentStatus["COMPLETE"],
              },
              {
                isAwaitingTransfer: true,
                status: PagBankPaymentStatus["DONE"],
              },
            ],
          },
        },
        plan: { include: { taxes: true } },
        graphicAccount: true,
      },
    });

    let details = {
      payedMachines: 0,
      payedTransactions: 0,
    };

    for (let i = 0; i < machines.length; i++) {
      const machine = machines[i];
      const transactions = machine.PagBankTransaction;
      const graphic = machine.graphicAccount;
      let groosTotal = 0;
      let taxTotal = 0;

      if (graphic) {
        const graphicBalance = {
          previous: graphic.balance,
          newBalance: 0,
        };
        for (const transaction of transactions) {
          if (transaction.status === 4) {
            groosTotal += transaction.grossAmount;
            taxTotal += transaction.taxTotal;
            details = {
              ...details,
              payedTransactions: details.payedTransactions + 1,
            };
          }
        }

        const amount = groosTotal - taxTotal;

        const adminAccount = await prisma.account.findUnique({
          where: { id: graphic.account_id },
        });

        const admin = await prisma.user.findFirst({
          where: { refId: adminAccount?.refId },
        });

        if (!admin)
          throw new AppError({
            message: "Admin account not found",
            status: 404,
          });

        const number_of_transaction =
          await getMaxNumberOfTransactionByGraphicAccountTransactions();
        const graphicTransaction =
          await prisma.graphicAccountTransaction.create({
            data: {
              graphic_account_id: graphic.id,
              amount: amount,
              newValue: graphic.balance + amount,
              previousValue: graphic.balance,
              data: {
                payer: admin,
                beneficiary: graphic,
              } as any,
              direction: "in",
              status: "done",
              type: "PAGBANK_PAYMENT",
              description: `Repasse da maquininha ${machine.description}`,
              number_of_transaction,
            },
          });

        notificationsEmitter.criarNotificacao({
          title: "Repasse recebido",
          message: `Você recebeu um repasse de R$${amount}`,
          graphicAccountId: graphic.id,
          schema: "graphicAccountTransaction",
          idSchema: graphic.id,
        });

        const _graphic = await prisma.graphicAccount.findUnique({
          where: { id: graphic.id },
        });

        if (!_graphic) {
          await prisma.graphicAccountTransaction.delete({
            where: { id: graphicTransaction.id },
          });
          throw new AppError({
            message: "Graphic account not found",
            status: 404,
          });
        }

        const updatedGraphicAccount = await prisma.graphicAccount.update({
          where: { id: graphic.id },
          data: { balance: _graphic.balance + amount },
        });

        graphicBalance.newBalance = updatedGraphicAccount.balance;

        await prisma.reportBalance.create({
          data: {
            graphic_account_id: graphic.id,
            amount: updatedGraphicAccount.balance,
            graphic_transaction_id: graphicTransaction.id,
            description: `Repasse da maquininha ${machine.description}`,
          },
        });

        if (admin && admin.refId) {
          console.log("graphic: ------->", graphic.account_id);
          const adminAccount = await prisma.account.findFirst({
            where: { id: graphic.account_id },
          });

          if (adminAccount) {
            const number_of_transaction_adminAccount =
              await getMaxNumberOfTransactionByAccountTransactions();
            const transaction = await prisma.accountTransaction.create({
              data: {
                account_id: adminAccount.id,
                amount: amount,
                previousValue: adminAccount.balance || 0,
                newValue: (adminAccount.balance || 0) - amount,
                number_of_transaction,
                data: {
                  payer: admin,
                  beneficiary: graphic,
                } as any,
                status: "done",
                direction: "out",
                type: "PAGBANK_PAYMENT",
                description: `Repasse para ${updatedGraphicAccount.name}`,
              },
            });

            await prisma.reportBalance.create({
              data: {
                account_id: adminAccount.id,
                amount: transaction.newValue,
                account_transaction_id: transaction.id,
                description: `Desconto sobre repasse da maquininha ${machine.description}`,
              },
            });

            await prisma.account.update({
              where: { id: adminAccount.id },
              data: {
                balance: (adminAccount.balance || 0) - amount,
              },
            });
          }
        }

        if (discount && description) {
          if (i === machines.length - 1 || machines.length === 1) {
            const graphicAccountWithDiscount =
              await prisma.graphicAccount.update({
                where: { id: updatedGraphicAccount.id },
                data: {
                  balance: updatedGraphicAccount.balance - discount,
                },
              });

            graphicBalance.newBalance = graphicAccountWithDiscount.balance;
            const number_of_transaction =
              await getMaxNumberOfTransactionByAccountTransactions();
            const transaction = await prisma.graphicAccountTransaction.create({
              data: {
                graphic_account_id: graphicAccountWithDiscount.id,
                amount: discount,
                newValue: graphicAccountWithDiscount.balance,
                previousValue: updatedGraphicAccount.balance,
                data: {
                  payer: graphicAccountWithDiscount,
                  beneficiary: admin,
                } as any,
                direction: "out",
                status: "done",
                type: "PAGBANK_PAYMENT_DISCOUNT",
                description:
                  description ||
                  `Desconto sobre repasse da maquininha ${machine.description}`,
              },
            });

            await prisma.reportBalance.create({
              data: {
                graphic_account_id: updatedGraphicAccount.id,
                amount: transaction.newValue,
                graphic_transaction_id: transaction.id,
                description: `Desconto sobre repasse da maquininha ${machine.description}`,
              },
            });

            if (admin && admin.refId) {
              const adminAccount = await prisma.account.findFirst({
                where: { refId: admin.refId },
              });

              if (adminAccount) {
                const number_of_transaction =
                  await getMaxNumberOfTransactionByAccountTransactions();
                const transaction = await prisma.accountTransaction.create({
                  data: {
                    account_id: adminAccount.id,
                    amount: discount,
                    number_of_transaction,
                    data: {
                      payer: graphicAccountWithDiscount,
                      beneficiary: admin,
                    } as any,
                    newValue: adminAccount.balance! + discount,
                    previousValue: adminAccount.balance!,
                    direction: "in",
                    status: "done",
                    type: "PAGBANK_PAYMENT_DISCOUNT",
                    description:
                      description ||
                      `Desconto sobre repasse da maquininha ${machine.description}`,
                  },
                });

                await prisma.reportBalance.create({
                  data: {
                    account_id: adminAccount.id,
                    amount: transaction.newValue,
                    account_transaction_id: transaction.id,
                    description: `Desconto sobre repasse da maquininha ${machine.description}`,
                  },
                });

                await prisma.account.update({
                  where: { id: adminAccount.id },
                  data: {
                    balance: (adminAccount.balance || 0) + discount,
                  },
                });
                notificationsEmitter.criarNotificacao({
                  title:
                    "Desconto sobre repasse da maquininha ${machine.description}",
                  message: `Você desconto de repasse da maquininha de R$${discount}`,
                  accountId: adminAccount.id,
                  schema: "accountTransaction",
                  idSchema: adminAccount.id,
                });
              }
            }
          }
        }

        for (const transaction of transactions) {
          await prisma.pagBankTransaction.update({
            where: { id: transaction.id },
            data: { isAwaitingTransfer: false },
          });
        }
      }

      details = {
        ...details,
        payedMachines: details.payedMachines + 1,
      };
    }

    return reply.status(200).send(details);
  } catch (error) {
    console.error("Erro ao listar pagamentos:", error);
    return reply.status(500).send({ error: "Erro ao listar pagamentos" });
  }
}
