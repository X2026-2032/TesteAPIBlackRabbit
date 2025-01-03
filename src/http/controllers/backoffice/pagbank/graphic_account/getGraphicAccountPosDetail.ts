import { PagBankPaymentStatus } from "@/@types/types";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function getGraphicAccountPosDetail(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const graphicAccountId = request.user.sub;

    const graphicAccount = await prisma.graphicAccount.findFirst({
      where: { role: "WALLET", id: graphicAccountId },
      include: {
        pagBankMachine: {
          include: {
            PagBankTransaction: {
              where: {
                status: 3,
              },
              orderBy: {
                created_at: "desc",
              },
            },
          },
        },
      },
    });

    if (!graphicAccount)
      throw new AppError({ message: "GraphicAccount not found", status: 404 });

    const data = graphicAccount.pagBankMachine && {
      ...graphicAccount,
      password_hash: undefined,
      pagBankMachine: undefined,
      pagBankMachines: graphicAccount.pagBankMachine.map((p) => ({
        ...p,
        PagBankTransaction: undefined,
        machineTransactions: p.PagBankTransaction,
        total: getTotal(p.PagBankTransaction),
      })),
    };

    return reply.status(200).send({
      ...data,
      totalToPayMachines: getTotalMachines(data.pagBankMachines),
    });
  } catch (error) {
    console.error("Erro ao listar pagamentos:", error);
    return reply.status(500).send({ error: "Erro ao listar pagamentos" });
  }
}

function getTotal(txs: PagBankTransaction[]) {
  let total = 0;

  console.log(txs.length);
  console.log(
    txs.filter((t) => t.status === PagBankPaymentStatus["COMPLETE"]).length,
  );

  for (const t of txs) {
    if (t.isAwaitingTransfer) {
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
