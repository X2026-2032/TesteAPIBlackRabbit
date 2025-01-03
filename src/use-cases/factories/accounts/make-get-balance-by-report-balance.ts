import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { GetBalanceByReportBalanceUseCase } from "@/use-cases/accounts/get-balance-by-report-balance";
import { PrismarReportBalanceRepository } from "@/repositories/prisma/prisma-report-balance-repository";

export function makeGetBalanceByReportBalanceUseCase() {
  const accountsRepository = new PrismaAccountsRepository();
  const reportBalanceRepository = new PrismarReportBalanceRepository();
  const getBalanceByReportBalanceUseCase = new GetBalanceByReportBalanceUseCase(
    reportBalanceRepository,
    accountsRepository,
  );

  return getBalanceByReportBalanceUseCase;
}
