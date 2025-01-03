import { PrismaBankSlipRepository } from "@/repositories/prisma/prisma-bank-slip-repository";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { GetBankSlipPdfByIdUseCase } from "@/use-cases/bank_slips/get-bank-slip-pdf-by-id-use-case";

export function makeGetBankSlipPdfById() {
  const repository = new PrismaBankSlipRepository();
  const usersRepository = new PrismaUsersRepository();

  return new GetBankSlipPdfByIdUseCase(repository, usersRepository);
}
