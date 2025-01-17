import { SELECT_TRANSACTIONS } from "../transactions/get-transactions";
import { UsersRepository } from "@/repositories/users-messenger-respository";
import { prisma } from "@/lib/prisma";

const select = SELECT_TRANSACTIONS;

type Params = {
  role: string;
  page: string;
  per_page: string;
  endDate: string;
  startDate: string;
};

export class FetchBackofficeTransactionsUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(params: Params) {
    const { role, page, per_page, endDate, startDate } = params;

    console.log("params", params);

    const skip = (parseInt(page) - 1) * parseInt(per_page);
    const take = parseInt(per_page);

    if (role === "ALL") {
      const transactions = await prisma.accountTransaction.findMany({
        orderBy: {
          created_at: "desc",
        },
      });

      const graphicTransactions =
        await prisma.graphicAccountTransaction.findMany({
          orderBy: {
            created_at: "desc",
          },
        });

      const allTx = await prisma.accountTransaction.findMany({});

      const allGa = await prisma.graphicAccountTransaction.findMany({});

      return {
        total: allTx.length + allGa.length,
        transactions: transactions.concat(graphicTransactions as any),
        page: +params.page!,
        current_page: per_page,
      };
    }

    if (role === "ALL_EXPORT") {
      const transactions = await prisma.accountTransaction.findMany({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      const graphicTransactions =
        await prisma.graphicAccountTransaction.findMany({
          where: {
            created_at: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: {
            created_at: "desc",
          },
        });

      const allTx = await prisma.accountTransaction.findMany({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const allGa = await prisma.graphicAccountTransaction.findMany({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      return {
        total: allTx.length + allGa.length,
        transactions: transactions.concat(graphicTransactions as any),
        page: +params.page!,
        current_page: per_page,
      };
    }

    if (role === "MEMBER") {
      const transactions = await prisma.accountTransaction.findMany({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          created_at: "desc",
        },
        skip: skip === 0 ? undefined : skip,
        take,
      });

      const all = await prisma.accountTransaction.findMany({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      return {
        total: all.length,
        transactions,
        page: +params.page!,
        current_page: per_page,
      };
    }

    if (role === "GRAPHIC") {
      const transactions = await prisma.graphicAccountTransaction.findMany({
        where: {
          GraphicAccount: {
            role: "GRAPHIC",
          },
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          created_at: "desc",
        },
        skip: skip === 0 ? undefined : skip,
        take,
      });

      const all = await prisma.graphicAccountTransaction.findMany({
        where: {
          GraphicAccount: {
            role: "GRAPHIC",
          },
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      return {
        total: all.length,
        transactions,
        page: +params.page!,
        current_page: per_page,
      };
    }

    if (role === "WALLET") {
      const transactions = await prisma.graphicAccountTransaction.findMany({
        orderBy: {
          created_at: "desc",
        },
      });

      return {
        total: transactions.length,
        transactions,
        page: +params.page!,
        current_page: per_page,
      };
    }

    if (role === "ALL TRANSACTIONS") {
      const transactions = await prisma.accountTransaction.findMany({
        orderBy: {
          created_at: "desc",
        },
      });

      const graphicTransactions =
        await prisma.graphicAccountTransaction.findMany({
          orderBy: {
            created_at: "desc",
          },
        });

      return {
        total: transactions.length + graphicTransactions.length,
        transactions: transactions.concat(graphicTransactions as any),
        page: +params.page!,
        current_page: per_page,
      };
    }
  }

  public async accountTransactions(queryParams: any) {
    const transactions = await prisma.accountTransaction.findMany({
      where: {
        ...queryParams.where,
      },
      select,
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
            id: true,
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

  public async getUserFromTransaction(transactionId: string) {
    try {
      const transaction = await prisma.accountTransaction.findUnique({
        where: {
          id: transactionId,
        },
      });

      if (!transaction) {
        return null;
      }

      const account = await prisma.accountUsers.findFirst({
        where: {
          account_id: transaction.account_id,
        },
      });

      if (!account) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: {
          id: account.user_id,
        },
      });

      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
