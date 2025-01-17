import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { AuthenticateUseCase } from "../authenticate";

export function makeAuthenticateUseCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();
  const accountsRepository = new PrismaAccountsRepository();
  const authenticateUseCase = new AuthenticateUseCase(
    usersRepository,
    accountsRepository,
  );

  return authenticateUseCase;
}
