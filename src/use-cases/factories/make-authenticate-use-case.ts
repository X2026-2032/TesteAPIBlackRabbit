import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { AuthenticateUseCase } from "../authenticate";

export function makeAuthenticateUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const accountsRepository = new PrismaAccountsRepository();
  const authenticateUseCase = new AuthenticateUseCase(
    usersRepository,
    accountsRepository,
  );

  return authenticateUseCase;
}
