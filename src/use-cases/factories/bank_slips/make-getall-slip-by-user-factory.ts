import { PrismaBankSlipRepository } from "@/repositories/prisma/prisma-bank-slip-repository";
import { GetSlipsByUserUseCase } from "@/use-cases/bank_slips/get-Slips-ByUserId-Use-Case";

export function makeGetSlipsByUserController() {
  const repository = new PrismaBankSlipRepository();
  const factory = new GetSlipsByUserUseCase(repository);

  return factory;
}
