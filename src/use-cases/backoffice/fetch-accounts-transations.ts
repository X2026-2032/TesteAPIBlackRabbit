import {
  TransactionsParams,
  TransactionsQueryParams,
} from "@/utils/transaction-query-params";

import { SELECT_TRANSACTIONS } from "../transactions/get-transactions";
import { prisma } from "@/lib/prisma";

const select = SELECT_TRANSACTIONS;

export class FetchBackofficeAccountsTransactionsUseCase {
  async execute(accountId: string, params: Partial<TransactionsParams>) {
    const queryParams = TransactionsQueryParams.params(params);
    let whereCondition;

    if (queryParams.start_date && queryParams.end_date) {
      const startDate = new Date(queryParams.start_date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(queryParams.end_date);
      endDate.setHours(23, 59, 59, 999);

      whereCondition = {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const graphic = await this.isGraphicAccount(accountId);

    if (graphic) {
      const graphicTransactions = await this.graphicAccountTransactions(
        accountId,
        queryParams,
        whereCondition,
      );

      return {
        transactions: {
          total: graphicTransactions.total,
          current_page: +params.page!,
          per_page: queryParams.per_page,
          data: graphicTransactions.transactions,
        },
      };
    }

    const accountTranscations = await this.accountTransactions(
      accountId,
      queryParams,
      whereCondition,
    );

    return {
      transactions: {
        total: accountTranscations.total,
        current_page: +params.page!,
        per_page: queryParams.per_page,
        data: accountTranscations.transactions,
      },
    };
  }

  public async accountTransactions(
    accountId: string,
    queryParams: any,
    whereCondition: any,
  ) {
    const transactions = await prisma.accountTransaction.findMany({
      where: {
        ...whereCondition,
        account_id: accountId,
      },
      select,
      orderBy: {
        created_at: "desc",
      },
    });

    const total = await prisma.accountTransaction.count({
      where: {
        ...whereCondition,
        account_id: accountId,
      },
    });
    return {
      total,
      transactions,
    };
  }

  private async graphicAccountTransactions(
    accountId: string,
    queryParams: any,
    whereCondition: any,
  ) {
    const transactions = await prisma.graphicAccountTransaction.findMany({
      where: {
        ...whereCondition,
        OR: [
          { graphic_account_id: accountId },
          {
            GraphicAccount: {
              account_id: accountId,
            },
          },
        ],
      },
      include: {
        GraphicAccount: {
          select: {
            id: true,
            name: true,
            document: true,
          },
        },
        ReportBalance: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    const total = await prisma.graphicAccountTransaction.count({
      where: {
        ...whereCondition,
        GraphicAccount: {
          account_id: accountId,
        },
      },
    });
    return {
      total,
      transactions,
    };
  }

  private async isGraphicAccount(id: string): Promise<boolean> {
    const graphicAccount = await prisma.graphicAccount.findUnique({
      where: {
        id,
      },
    });

    return !!graphicAccount;
  }
}
