import { prisma } from "@/lib/prisma";
import {
  TransactionsParams,
  TransactionsQueryParams,
} from "@/utils/transaction-query-params";
import { SELECT_TRANSACTIONS } from "../transactions/get-transactions";

const select = SELECT_TRANSACTIONS;

export class FetchBackofficeBankTransfersUseCase {
  async execute(params: Partial<TransactionsParams>) {
    const queryParams = TransactionsQueryParams.params(params);

    queryParams.where.type = undefined;

    const gt = await this.graphicAccountTransactions(queryParams);

    const at = await this.accountTransactions(queryParams);

    return {
      transactions: {
        total: gt.total + at.total,
        current_page: +params.page!,
        per_page: queryParams.per_page,
        data: gt.transactions.concat(at.transactions),
      },
    };
  }

  public async accountTransactions(queryParams: any) {
    const transactions = await prisma.accountTransaction.findMany({
      where: {
        ...queryParams.where,
      },
      include: {
        Account: {
          include: {
            user: {
              select: {
                name: true,
                document: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip: queryParams.page,
      take: queryParams.per_page,
    });

    const total = await prisma.accountTransaction.count({
      where: {
        ...queryParams.where,
      },
    });
    return {
      total,
      transactions,
    };
  }

  public async graphicAccountTransactions(queryParams: any) {
    const transactions = await prisma.graphicAccountTransaction.findMany({
      where: {
        ...queryParams.where,
      },
      include: {
        GraphicAccount: {
          select: {
            name: true,
            document: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip: queryParams.page,
      take: queryParams.per_page,
    });
    const total = await prisma.graphicAccountTransaction.count({
      where: {
        ...queryParams.where,
      },
    });
    return {
      total,
      transactions,
    };
  }
}
