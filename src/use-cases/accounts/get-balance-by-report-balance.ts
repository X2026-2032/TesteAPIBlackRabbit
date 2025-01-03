import { requestError } from "@/lib/axios";
import { AppError } from "../errors/app-error";
import { AccountsRepository } from "@/repositories/accounts-repository";
import { ReportBalanceRepository } from "@/repositories/report-balance-repository";

interface GetBalanceByReportBalanceUseCaseRequest {
  userId: string;
}

export class GetBalanceByReportBalanceUseCase {
  constructor(
    private reportBalanceRepository: ReportBalanceRepository,
    private accountRepository: AccountsRepository,
  ) {}

  async execute(params: GetBalanceByReportBalanceUseCaseRequest) {
    try {
      const account = await this.accountRepository.findByUserId(params.userId);
      if (!account)
        throw new AppError({
          message: "Account not found",
        });

      const balance = await this.reportBalanceRepository.getBalance(account.id);
      if (!balance)
        throw new AppError({
          message: "Balance not found",
        });

      return { balance };
    } catch (err) {
      throw new AppError(requestError(err));
    }
  }
}
