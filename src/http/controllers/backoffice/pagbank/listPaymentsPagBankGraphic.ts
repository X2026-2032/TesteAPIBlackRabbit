import { prisma } from "@/lib/prisma";
import { PagBankTransaction } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import moment from "moment";

export async function listPaymentsPagBankGraphic(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { startDate, endDate, graphic_account_id } = request.params as {
      startDate: string;
      endDate: string;
      graphic_account_id: string;
    };

    if (!startDate || !endDate) {
      return reply
        .status(400)
        .send({ error: "As datas de início e fim são obrigatórias." });
    }

    const machines = await prisma.pagBankCardMachine.findMany({
      where: { graphic_account_id },
    });

    let payments: PagBankTransaction[] = [];

    const _endDate = moment(endDate).set("hour", 23).set("minute", 59).toDate();

    for (const machine of machines) {
      const pys = await prisma.pagBankTransaction.findMany({
        where: {
          AND: [
            {
              created_at: {
                gte: new Date(startDate),
                lte: _endDate,
              },
            },
            {
              machineId: machine.id,
            },
          ],
        },
        orderBy: {
          created_at: "desc",
        },
      });

      payments = [...payments, ...pys];
    }

    return reply.status(200).send(payments);
  } catch (error) {
    console.error("Erro ao listar pagamentos:", error);
    return reply.status(500).send({ error: "Erro ao listar pagamentos" });
  }
}
