import moment from "moment";
import { CronJob } from "cron";
import { api } from "@/lib/axios";
import { TED } from "@/@types/types";
import { prisma } from "@/lib/prisma";
import notificationsEmitter from "@/handlers/notificationEventsEmitter";
import { getMaxNumberOfTransactionByAccountTransactions } from "@/utils";

export default async function observeTedTransactions() {
  const job = new CronJob(`0 * * * *`, getTeds);
  job.start();
}

export async function getTeds() {
  try {
    const users = await prisma.user.findMany();

    let savedTeds = 0;

    for (const u of users) {
      if (u.document === "39778028000190") {
        continue;
      }

      const apiKey = u.api_key;

      if (!u.refId) continue;
      if (!apiKey) continue;

      const account = await prisma.account.findFirst({
        where: { refId: u.refId },
      });

      if (!account) continue;

      const now = moment();
      const format = "YYYY-MM-DD";

      const response = await api.get("/baas/api/v2/transactions", {
        params: {
          type: types.TED_IN,
          limit: 9999999,
          page: 1,
          isCredit: true,
          startDate: now.format(format),
          endDate: now.format(format),
        },
        headers: {
          "x-delbank-api-key": apiKey,
        },
      });

      const teds: TED[] = response.data;

      for (const ted of teds) {
        await prisma.$transaction(async (tx) => {
          const existsTed = await prisma.accountTransaction.findFirst({
            where: { transaction_id: ted.id },
          });
          if (!existsTed) {
            const number_of_transaction =
              await getMaxNumberOfTransactionByAccountTransactions();

            await tx.accountTransaction.create({
              data: {
                transaction_id: ted.id,
                amount: ted.amount,
                direction: "in",
                type: "TED",
                previousValue: account.balance!,
                newValue: account.balance! + ted.amount,
                account_id: account.id,
                status: "done",
                response: ted,
                created_at: ted.createdAt,
                number_of_transaction,
              },
            });

            const notificationData = {
              title: "Ted recebido",
              message: `Você recebeu um ted de ${ted.amount} reais`,
              accountId: account.id,
              schema: "accountTransaction",
              schema_id: account.id,
            };

            notificationsEmitter.criarNotificacao(notificationData);

            savedTeds += 1;
          }
        });
      }
    }
  } catch (error) {
    console.log("Houve um erro ao processar TEDs pendentes...");
  }
}

const types = {
  INTERNAL_OUT: "DEBIT_TRANSFER_INTERNAL",
  INTERNAL_IN: "CREDIT_TRANSFER_INTERNAL",
  TED_OUT: "DEBIT_TRANSFER_EXTERNAL",
  TED_IN: "CREDIT_TRANSFER_EXTERNAL",
  PIX_OUT: "DEBIT_PIX",
  PIX_IN: "CREDIT_PIX",
};
