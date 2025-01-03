import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

interface QueryParameters {
  startDate?: string;
  endDate?: string;
}

export async function getAllGraphicTransactionsAndTax(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { startDate, endDate } = request.query as QueryParameters;

    const startDateFilter = startDate ? new Date(startDate) : undefined;
    const endDateFilter = endDate ? new Date(endDate) : undefined;

    const adjustDateToStartOfDay = (date?: Date) => {
      if (!date) return undefined;
      const adjustedDate = new Date(date);
      adjustedDate.setUTCHours(0, 0, 0, 0);
      return adjustedDate;
    };

    const adjustDateToEndOfDay = (date?: Date) => {
      if (!date) return undefined;
      const adjustedDate = new Date(date);
      adjustedDate.setUTCHours(23, 59, 59, 999);
      return adjustedDate;
    };

    const getAllAccountTransactions = await prisma.accountTransaction.count({
      where: {
        type: {
          not: "INTERNAL_TAX",
        },
        status: "done",
        created_at: {
          gte: adjustDateToStartOfDay(startDateFilter),
          lte: adjustDateToEndOfDay(endDateFilter),
        },
        nsu: {
          not: null,
        },
        number_of_transaction: {
          not: null,
        },
      },
    });

    const getAllGraphicAccountTransaction =
      await prisma.graphicAccountTransaction.count({
        where: {
          type: {
            not: "INTERNAL_TAX",
          },
          status: "done",
          created_at: {
            gte: adjustDateToStartOfDay(startDateFilter),
            lte: adjustDateToEndOfDay(endDateFilter),
          },
          nsu: {
            not: null,
          },
          number_of_transaction: {
            not: null,
          },
        },
      });

    const getAllInternalTaxTransactions =
      await prisma.accountTransaction.aggregate({
        where: {
          type: "INTERNAL_TAX",
          created_at: {
            gte: adjustDateToStartOfDay(startDateFilter),
            lte: adjustDateToEndOfDay(endDateFilter),
          },
          number_of_transaction: {
            not: null,
          },
        },
        _count: true,
      });

    const getAllInternalGraphicTaxTransactions =
      await prisma.graphicAccountTransaction.aggregate({
        where: {
          type: "INTERNAL_TAX",
          created_at: {
            gte: adjustDateToStartOfDay(startDateFilter),
            lte: adjustDateToEndOfDay(endDateFilter),
          },
          number_of_transaction: {
            not: null,
          },
        },
        _count: true,
      });

    const getAccountTransactionsWithNullNsu =
      await prisma.accountTransaction.count({
        where: {
          type: {
            not: "INTERNAL_TAX",
          },
          status: "done",
          created_at: {
            gte: adjustDateToStartOfDay(startDateFilter),
            lte: adjustDateToEndOfDay(endDateFilter),
          },
          nsu: null,
        },
      });

    const getGraphicAccountTransactionsWithNullNsu =
      await prisma.graphicAccountTransaction.count({
        where: {
          type: {
            not: "INTERNAL_TAX",
          },
          status: "done",
          created_at: {
            gte: adjustDateToStartOfDay(startDateFilter),
            lte: adjustDateToEndOfDay(endDateFilter),
          },
          nsu: null,
        },
      });

    // Calcular os totais
    const allTransactionsTotal =
      getAllAccountTransactions + getAllGraphicAccountTransaction;
    const allTaxesTotal =
      getAllInternalTaxTransactions._count +
      getAllInternalGraphicTaxTransactions._count;
    const allSuspiciousTransactionsTotal =
      getAccountTransactionsWithNullNsu +
      getGraphicAccountTransactionsWithNullNsu;

    return reply.status(200).send({
      allTransactions: allTransactionsTotal,
      transactions: getAllAccountTransactions,
      graphicTransactions: getAllGraphicAccountTransaction,
      tax: getAllInternalTaxTransactions._count,
      graphicTax: getAllInternalGraphicTaxTransactions._count,
      allTaxes: allTaxesTotal,
      transactionsWithNullNsu: getAccountTransactionsWithNullNsu,
      graphicTransactionsWithNullNsu: getGraphicAccountTransactionsWithNullNsu,
      allSuspiciousTransactions: allSuspiciousTransactionsTotal,
    });
  } catch (error: any) {
    throw new AppError(error);
  }
}
