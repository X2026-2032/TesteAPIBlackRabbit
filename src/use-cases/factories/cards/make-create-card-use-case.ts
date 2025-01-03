import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { CreateCardUseCase } from "@/use-cases/cards/create-card";
import { PrismaCardsRepository } from "@/repositories/prisma/prisma-cards-repository";

export function makeCreateCardUseCase() {
  const repository = new PrismaCardsRepository();
  const usersRepository = new PrismaUsersRepository();
  const accountsRepository = new PrismaAccountsRepository();
  const createCardUseCase = new CreateCardUseCase(
    repository,
    usersRepository,
    accountsRepository,
  );

  return createCardUseCase;
}
