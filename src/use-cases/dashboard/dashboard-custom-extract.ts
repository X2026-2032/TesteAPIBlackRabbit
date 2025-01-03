import { prisma } from "@/lib/prisma";
import { TransactionsQueryParams } from "@/utils/transaction-query-params";

export type DashboardCustomExtractParams = {
  end_date: string;
  start_date: string;
};

export type DashboardCustomExtractResp = {
  in: number;
  out: number;
};

export class DashboardCustomExtractUseCase {
  public async execute(params: DashboardCustomExtractParams, userId: string) {
    const queryParams = TransactionsQueryParams.params(params);

    const graphic = await prisma.graphicAccount.findUnique({
      where: {
        id: userId,
      },
    });

    if (graphic) {
      const where = {
        ...queryParams.where,
        graphic_account_id: graphic.id,
        status: "done",
      };

      const [_in, _out] = await prisma.$transaction([
        prisma.graphicAccountTransaction.groupBy(
          this.buildSqlGroupBy(where, "in", "graphic_account_id"),
        ),
        prisma.graphicAccountTransaction.groupBy(
          this.buildSqlGroupBy(where, "out", "graphic_account_id"),
        ),
      ]);

      return this.build(_in, _out);
    }
    const where = {
      Account: {
        user_id: userId,
      },
      ...queryParams.where,
    };
    const [_in, _out] = await prisma.$transaction([
      prisma.accountTransaction.groupBy(
        this.buildSqlGroupBy(where, "in", "account_id"),
      ),
      prisma.accountTransaction.groupBy(
        this.buildSqlGroupBy(where, "out", "account_id"),
      ),
    ]);
    return this.build(_in, _out);
  }
  private build(_in: any, _out: any) {
    return {
      in: _in[0]?._sum?.amount ?? 0,
      out: _out[0]?._sum?.amount ?? 0,
    };
  }

  private buildSqlGroupBy(where: any, direction: string, by: string) {
    return {
      by: [by],
      where: {
        ...where,
        direction,
      },
      _sum: {
        amount: true,
      },
    } as any;
  }
}
