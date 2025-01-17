import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { RegisterDocumentsUseCase } from "../register-documents";

export function makeRegisterDocumentsUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const accountsRepository = new PrismaAccountsRepository();

  const registerDocumentsUseCase = new RegisterDocumentsUseCase(
    usersRepository,
    accountsRepository,
  );

  return registerDocumentsUseCase;
}
