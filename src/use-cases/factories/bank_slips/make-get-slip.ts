import { BankSlipRepository } from "@/repositories/bank-slip-repository";
import { GetSlipUseCase } from "@/use-cases/bank_slips/get-slip";

export function makeGetSlipUseCase(
  repository: BankSlipRepository,
): GetSlipUseCase {
  return new GetSlipUseCase(repository);
}
