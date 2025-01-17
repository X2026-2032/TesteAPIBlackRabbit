import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { RegisterDocumentsUseCase } from "../register-documents";

export function makeRegisterDocumentsUseCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();
  const accountsRepository = new PrismaAccountsRepository();

  const registerDocumentsUseCase = new RegisterDocumentsUseCase(
    usersRepository,
    accountsRepository,
  );

  return registerDocumentsUseCase;
}
