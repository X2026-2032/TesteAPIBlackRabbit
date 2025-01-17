import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { CreateCardUseCase } from "@/use-cases/cards/create-card";
import { PrismaCardsRepository } from "@/repositories/prisma/prisma-cards-repository";

export function makeCreateCardUseCase() {
  const repository = new PrismaCardsRepository();
  const usersRepository = new PrismaGraphicAccountUsersRepository();
  const accountsRepository = new PrismaAccountsRepository();
  const createCardUseCase = new CreateCardUseCase(
    repository,
    usersRepository,
    accountsRepository,
  );

  return createCardUseCase;
}
