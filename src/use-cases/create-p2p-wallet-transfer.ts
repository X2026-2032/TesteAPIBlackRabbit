import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { PerformTaxUseCase, TaxNames } from "./tax/performTax";
import { getMaxNumberOfTransactionByGraphicAccountTransactions } from "@/utils";

interface CreateP2pTransferUseCaseRequest {
  userId: string;
  amount: number;
  payee_id: string;
  description?: string;
}

export class CreateP2pTransferWallet {
  async execute({
    userId,
    amount,
    payee_id,
    description,
  }: CreateP2pTransferUseCaseRequest) {
    try {
      // conta do pagador
      const payer = await prisma.graphicAccount.findFirst({
        where: {
          id: userId,
        },
      });

      if (!payer) throw new Error("Conta do pagador não encontrada");

      //conta do beneficiario
      let beneficiary = [] as any;

      beneficiary = await prisma.graphicAccount.findFirst({
        where: {
          id: payee_id,
        },
        include: {
          user: true,
        },
      });

      if (!beneficiary) {
        beneficiary = await prisma.user.findFirst({
          where: {
            id: payee_id,
          },
        });
        if (!beneficiary) throw new Error("Conta não encontrada");
        if (beneficiary.role === "ADMIN_BAG") {
          await prisma.graphicAccount.update({
            where: {
              id: payer.id,
            },
            data: {
              balance: payer.balance - amount,
            },
          });
          const number_of_transaction =
            await getMaxNumberOfTransactionByGraphicAccountTransactions();
          const transaction = await prisma.graphicAccountTransaction.create({
            data: {
              amount,
              number_of_transaction,
              data: new Date(),
              direction: "out",
              type: "p2p_transfer_wallet",
              user_id_graphic: payer.id,
              status: "done",
              response: {
                toJSON: {
                  beneficiary,
                  payer,
                },
              },
              transaction_id: randomUUID(),
            },
          });

          await PerformTaxUseCase.execute({
            account_id: payer.account_id,
            taxType: TaxNames.TRANSFERÊNCIA_ENTRE_WALLET,
            transactionAmmount: amount,
            number_of_transactions: transaction.number_of_transaction!,
            createdAt: transaction.created_at,
          });

          await prisma.reportBalance.create({
            data: {
              graphic_account_id: payer.id,
              graphic_transaction_id: transaction.id,
              amount: payer.balance - amount,
              description,
            },
          });
          return transaction;
        }
      }

      if (!beneficiary) throw new Error("Conta não encontrada");

      const payer_balance = payer.balance;
      const beneficiary_balance = beneficiary.balance;

      await prisma.graphicAccount.update({
        where: {
          id: payer.id,
        },
        data: {
          balance: payer_balance - amount,
        },
      });
      await prisma.graphicAccount.update({
        where: {
          id: beneficiary.id,
        },
        data: {
          balance: beneficiary_balance + amount,
        },
      });

      console.log(payer.account_id);
      const number_of_transaction =
        await getMaxNumberOfTransactionByGraphicAccountTransactions();
      const transaction = await prisma.graphicAccountTransaction.create({
        data: {
          amount,
          number_of_transaction,
          data: new Date(),
          direction: "out",
          type: "p2p_transfer_wallet",
          user_id_graphic: payer.id,
          status: "done",
          response: {
            toJSON: {
              beneficiary,
              payer,
            },
          },
          transaction_id: randomUUID(),
        },
      });

      await PerformTaxUseCase.execute({
        account_id: payer.id,
        taxType: TaxNames.TRANSFERÊNCIA_ENTRE_WALLET,
        transactionAmmount: amount,
        number_of_transactions: transaction.number_of_transaction!,
        createdAt: transaction.created_at,
      });

      await prisma.reportBalance.create({
        data: {
          graphic_account_id: payer.id,
          amount: payer_balance - amount,
          graphic_transaction_id: transaction.id,
          description,
        },
      });

      return transaction;
    } catch (err: any) {
      console.log(err);
      throw new Error(err);
    }
  }
}
