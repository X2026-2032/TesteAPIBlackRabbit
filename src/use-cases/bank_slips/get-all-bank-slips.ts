import { BankSlipRepository } from "@/repositories/bank-slip-repository";
import { TransactionsParams } from "@/utils/transaction-query-params";
import { BankSlip } from "@prisma/client";

export class GetAllBankSlipsUseCase {
  constructor(private repository: BankSlipRepository) {}

  async execute(
    userId: string,
    queryParams: Partial<TransactionsParams>,
  ): Promise<BankSlip[]> {
    const bankSlips = await this.repository.getPaginatedBankSlips(
      userId,
      queryParams,
    );
    return bankSlips;
  }
}
