import { BankSlipRepository } from "@/repositories/bank-slip-repository";
import { GetMonthlyTotalPaidByUserIdUseCase } from "@/use-cases/bank_slips/get-monthly-total-paid-by-user-id-use-case";

export function makeGetMonthlyTotalPaidByUserIdUseCase(
  repository: BankSlipRepository,
): GetMonthlyTotalPaidByUserIdUseCase {
  return new GetMonthlyTotalPaidByUserIdUseCase(repository);
}
