import { PrismaBankSlipRepository } from "@/repositories/prisma/prisma-bank-slip-repository";
import { PrismaPayerRepository } from "@/repositories/prisma/prisma-payers-repository";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { CreateBankSlipUseCase } from "@/use-cases/bank_slips/create-bank-slip";

export function makeCreateBankSlipUseCase() {
  const repository = new PrismaBankSlipRepository();
  const payerRepository = new PrismaPayerRepository();
  const usersRepository = new PrismaUsersRepository();

  const createBankSlipUseCase = new CreateBankSlipUseCase(
    repository,
    payerRepository,
    usersRepository,
  );

  return createBankSlipUseCase;
}
