import { CronJob } from "cron";
import { api } from "@/lib/axios";
import { prisma } from "@/lib/prisma";
import generateUUID from "@/utils/generateUUID";

export function startPixScheduleCron() {
  const job = new CronJob("0 10 * * *", async () => {
    try {
      const currentDateTime = new Date();

      const transactions = await prisma.accountTransaction.findMany({
        where: {
          status: "waiting",
          scheduled: true,
          scheduled_at: {
            lte: currentDateTime,
          },
        },
      });

      if (transactions.length > 0) {
        for (const transaction of transactions) {
          try {
            const data = {
              amount: transaction.amount,
              description: transaction.description,
              beneficiary: transaction.beneficiary,
            };

            const response = await api.post("/baas/api/v2/transfers", data, {
              headers: {
                "x-delbank-api-key": transaction.apiKey,
                IdempotencyKey: generateUUID(),
              },
            });

            await prisma.$transaction(async (tx) => {
              await tx.accountTransaction.update({
                where: { id: transaction.id },
                data: {
                  response: response.data,
                  data: response.data,
                  status: "done",
                },
              });
            });
          } catch (error) {
            console.error("Erro ao processar transação:", error);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar transações agendadas:", error);
    }
  });

  job.start();
}
