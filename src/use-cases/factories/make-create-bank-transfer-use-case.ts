import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { CreateBankTransferUseCase } from "../create-bank-transfer";
import { PrismaBankTransfersRepository } from "@/repositories/prisma/prisma-bank-transfers-repository";
import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";

export function makeCreateBankTransferCase() {
  const usersRepository = new PrismaUsersRepository();
  const accountsRepository = new PrismaAccountsRepository();
  const bankTransfersRepository = new PrismaBankTransfersRepository();

  const fetchTransactionsUseCase = new CreateBankTransferUseCase(
    usersRepository,
    accountsRepository,
    bankTransfersRepository,
  );

  return fetchTransactionsUseCase;
}
