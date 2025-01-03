import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import moment from "moment";

export async function listPaymentsPagBank(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { startDate, endDate } = request.params as {
      startDate: string;
      endDate: string;
    };

    const _endDate = moment(endDate).set("hour", 23).set("minute", 59).toDate();

    console.log(_endDate);

    if (!startDate || !endDate) {
      return reply
        .status(400)
        .send({ error: "As datas de início e fim são obrigatórias." });
    }

    const payments = await prisma.pagBankTransaction.findMany({
      where: {
        created_at: {
          gte: new Date(startDate),
          lte: _endDate,
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return reply.status(200).send(payments);
  } catch (error) {
    console.error("Erro ao listar pagamentos:", error);
    return reply.status(500).send({ error: "Erro ao listar pagamentos" });
  }
}
