import { PrismaBankTransfersRepository } from "@/repositories/prisma/prisma-bank-transfers-repository";
import { GetByAccountBankTransferUseCase } from "@/use-cases/bank_transfers/get-by-account";

export function makeGetByAccountBankTransferUseCase() {
  const repository = new PrismaBankTransfersRepository();
  const getByAccountBankTransferUseCase = new GetByAccountBankTransferUseCase(
    repository,
  );

  return getByAccountBankTransferUseCase;
}
