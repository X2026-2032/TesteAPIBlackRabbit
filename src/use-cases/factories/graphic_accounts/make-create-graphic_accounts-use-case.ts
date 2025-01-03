import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { CreateGrapicAccountUseCase } from "@/use-cases/graphic_accounts/create-graphic_accounts";

export function makeCreateGrapicAccountUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const accountsRepository = new PrismaAccountsRepository();

  const createGrapicAccountUseCase = new CreateGrapicAccountUseCase(
    usersRepository,
    accountsRepository,
  );

  return createGrapicAccountUseCase;
}
