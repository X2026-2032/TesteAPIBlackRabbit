import { PrismaBankTransfersRepository } from "@/repositories/prisma/prisma-bank-transfers-repository";
import { FindAllBankTransfersUseCase } from "@/use-cases/bank_transfers/find-all-bank-transfers";

export function makeFindAllBankTransfersUseCase() {
  const repository = new PrismaBankTransfersRepository();
  const findAllBankTransfersUseCase = new FindAllBankTransfersUseCase(
    repository,
  );

  return findAllBankTransfersUseCase;
}
