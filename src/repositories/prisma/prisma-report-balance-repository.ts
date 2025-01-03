import { PrismaClient } from "@prisma/client";
import { ReportBalanceRepository } from "../report-balance-repository";

const prisma = new PrismaClient();

export class PrismarReportBalanceRepository implements ReportBalanceRepository {
  async getBalance(accountId: string) {
    const reportBalance = await prisma.reportBalance.findFirst({
      where: {
        account_id: accountId,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (!reportBalance) return null;

    return reportBalance.amount;
  }
}
