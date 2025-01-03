import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function getAllTransactionsAndTax(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const getAllAccountTransactions = await prisma.accountTransaction.count({
      where: {
        type: {
          not: "INTERNAL_TAX",
        },
      },
    });

    const getAllGraphicAccountTransaction =
      await prisma.graphicAccountTransaction.count({
        where: {
          type: {
            not: "INTERNAL_TAX",
          },
        },
      });

    const getAllInternalTaxTransactions =
      await prisma.accountTransaction.findMany({
        where: {
          type: "INTERNAL_TAX",
        },
      });

    return reply.status(200).send({
      transactions: getAllAccountTransactions + getAllGraphicAccountTransaction,
      tax: getAllInternalTaxTransactions,
    });
  } catch (error: any) {
    throw new AppError(error);
  }
}
