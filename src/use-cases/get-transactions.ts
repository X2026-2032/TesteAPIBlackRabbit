import { prisma } from "@/lib/prisma";

export class GetTransactionsUseCase {
  async execute(
    userId: string,
    params: { start?: string; end?: string; page?: number; perPage?: number },
  ) {
    let whereCondition = {};
    let pagination = {};

    if (params.page !== undefined && params.perPage !== undefined) {
      pagination = {
        take: Number(params.perPage),
        skip: Number(params.page - 1) * Number(params.perPage),
      };
    }

    if (params.start && params.end) {
      const startDate = new Date(params.start);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(params.end);
      endDate.setHours(23, 59, 59, 999);

      whereCondition = {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const graphic = await prisma.graphicAccount.findUnique({
      where: {
        id: userId,
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        Account: {
          where: {
            user_id: userId,
          },
        },
      },
    });

    if (graphic) {
      const transactions = await prisma.graphicAccountTransaction.findMany({
        where: {
          ...whereCondition,
          graphic_account_id: graphic.id,
          status: "done",
          OR: [
            {
              NOT: {
                amount: 0,
              },
            },
            { type: "PAGBANK_PAYMENT" },
            { type: "PAGBANK_PAYMENT_DISCOUNT" },
          ],
        },
        include: {
          ReportBalance: true,
        },
        orderBy: {
          created_at: "desc",
        },
        ...pagination,
      });

      const count = await prisma.graphicAccountTransaction.count({
        where: {
          ...whereCondition,
          graphic_account_id: graphic.id,
        },
      });

      return {
        transactions: {
          total: count,
          data: transactions,
        },
      };
    }

    const transactions = await prisma.accountTransaction.findMany({
      where: {
        ...whereCondition,
        account_id: user?.Account[0].id,
        NOT: {
          OR: [{ status: "PENDING" }],
        },
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        ReportBalance: true,
      },
      ...pagination,
    });

    const count = await prisma.accountTransaction.count({
      where: {
        ...whereCondition,
        account_id: user?.Account[0].id,
        NOT: {
          status: "PENDING",
        },
      },
    });

    return {
      transactions: {
        total: count,
        data: transactions,
      },
    };
  }
}
