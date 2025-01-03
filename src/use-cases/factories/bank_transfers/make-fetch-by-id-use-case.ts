import { PrismaBankTransfersRepository } from "@/repositories/prisma/prisma-bank-transfers-repository";
import { FindBankTransferByIdUseCase } from "@/use-cases/bank_transfers/find-by-id";

export function makeFindBankTransferByIdUseCase() {
  const repository = new PrismaBankTransfersRepository();
  const findBankTransferByIdUseCase = new FindBankTransferByIdUseCase(
    repository,
  );

  return findBankTransferByIdUseCase;
}
