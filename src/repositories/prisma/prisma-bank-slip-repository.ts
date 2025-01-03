import { PrismaClient, BankSlip, Prisma } from "@prisma/client";
import { BankSlipRepository } from "../bank-slip-repository";
import { prisma } from "@/lib/prisma";
import {
  TransactionsParams,
  TransactionsQueryParams,
} from "@/utils/transaction-query-params";
import { GetTransactios } from "@/use-cases/transactions/get-transactions";

export class PrismaBankSlipRepository implements BankSlipRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllBankSlips(): Promise<BankSlip[]> {
    const bankSlips = await this.prisma.bankSlip.findMany();
    return bankSlips;
  }

  async count(): Promise<number> {
    return await this.prisma.bankSlip.count();
  }

  async getPaginatedBankSlips(
    userId: string,
    params: Partial<TransactionsParams>
  ): Promise<any> {
    const queryParams = TransactionsQueryParams.params(params);

    queryParams.where.type = "bank_slips";
    const ft = new GetTransactios();

    const graphic = await prisma.graphicAccount.findUnique({
      where: {
        id: userId,
      },
    });
    if (graphic) {
      const { transactions, total } = await ft.getGraphicAccountTransaction(
        graphic.id,
        queryParams
      );
      return {
        transactions: {
          total,
          current_page: queryParams.page,
          per_page: queryParams.per_page,
          data: this.buildItemsBankSplis(transactions),
        },
      };
    }
    const { transactions, total } = await ft.accountTransaction(
      userId,
      queryParams
    );

    return {
      transactions: {
        total,
        current_page: queryParams.page,
        per_page: queryParams.per_page,
        data: this.buildItemsBankSplis(transactions),
      },
    };
  }
  private buildItemsBankSplis(items: any[]) {
    return items.map((item) => {
      const data = item.data as any;
      return {
        ...item,
        data: undefined,
        amount: data.amount,
        due_date: data.due_date,
        payer: {
          name: data.payer.name,
        },
      };
    }) as any;
  }

  create(data: Prisma.BankSlipCreateInput): Promise<BankSlip> {
    return this.prisma.bankSlip.create({ data });
  }

  async findById(id: string): Promise<BankSlip | null> {
    return this.prisma.bankSlip.findUnique({
      where: { id },
      include: { payer: { include: { address: true } }, Tax: true },
    });
  }

  async findByUserId(userId: string): Promise<BankSlip[]> {
    return this.prisma.bankSlip.findMany({
      where: {
        id: userId,
      },
      include: { payer: { include: { address: true } }, Tax: true },
    });
  }

  async getMonthlyTotalPaidByUserId(userId: string): Promise<number> {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const result = await this.prisma.bankSlip.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        payer: {
          id: userId,
        },
        created_at: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1),
        },
      },
    });

    return result._sum.amount || 0;
  }
  private queryParams(params: Partial<BankSlipQueryParams>) {
    let query: Record<string, any> = {};
    if (params.status) {
      query.status = params.status;
    }
    return {
      query,
      page: (+params.page! - 1) * +params.pageSize!,
      per_page: +params.pageSize!,
    };
  }
}
