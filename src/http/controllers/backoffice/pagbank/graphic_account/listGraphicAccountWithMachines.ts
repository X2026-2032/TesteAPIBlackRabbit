import { PagBankPaymentStatus } from "@/@types/types";
import { prisma } from "@/lib/prisma";
import { PagBankTransaction } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

export async function listGraphicAccountWithMachines(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { startDate, endDate } = request.query as Record<string, any>;

    const transactionWhereClause: any = {};

    if (startDate) {
      const startDateDate = new Date(startDate);
      transactionWhereClause.created_at = {
        ...transactionWhereClause.created_at,
        gte: startDateDate,
      };
    }

    if (endDate) {
      const endDateDate = new Date(endDate);
      transactionWhereClause.created_at = {
        ...transactionWhereClause.created_at,
        lte: endDateDate,
      };
    }
    const graphicAccounts = await prisma.graphicAccount.findMany({
      where: { role: "WALLET" },
      include: {
        pagBankMachine: {
          include: {
            PagBankTransaction: {
              orderBy: {
                created_at: "desc",
              },
              where: {
                machineId: {
                  not: null,
                },
                isAwaitingTransfer: true,
              },
            },
          },
        },
      },
    });

    const filteredGraphicAccounts = graphicAccounts.map(
      (g) =>
        g.pagBankMachine && {
          ...g,
          password_hash: undefined,
          pagBankMachine: undefined,
          pagBankMachines: g.pagBankMachine.map((p) => ({
            ...p,
            PagBankTransaction: undefined,
            machineTransactions: p.PagBankTransaction,
            total: getTotal(p.PagBankTransaction),
          })),
        },
    );

    const _lastFilter = filteredGraphicAccounts.map(
      (g) =>
        g.pagBankMachines && {
          ...g,
          totalToPayMachines: getTotalMachines(g.pagBankMachines),
        },
    );

    return reply.status(200).send(_lastFilter);
  } catch (error) {
    return reply.status(500).send({ error: "Erro ao listar pagamentos" });
  }
}

function getTotal(txs: PagBankTransaction[]) {
  let total = 0;

  for (const t of txs) {
    if (
      (t.status == PagBankPaymentStatus["COMPLETE"] && t.isAwaitingTransfer) ||
      (t.status == PagBankPaymentStatus["DONE"] && t.isAwaitingTransfer)
    ) {
      total += t.grossAmount - t.taxTotal;
    }
  }
  return total;
}

function getTotalMachines(machines: { total: number }[]) {
  let total = 0;

  for (const machine of machines) {
    total += machine.total ? machine.total : 0;
  }
  return total;
}
