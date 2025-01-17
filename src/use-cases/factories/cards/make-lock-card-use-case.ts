import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { PrismaCardsRepository } from "@/repositories/prisma/prisma-cards-repository";
import { LockCardUseCase } from "@/use-cases/cards/lock-card";

export function makeLockCardUseCase() {
  const repository = new PrismaCardsRepository();
  const usersRepository = new PrismaGraphicAccountUsersRepository();
  const lockCardUseCase = new LockCardUseCase(repository, usersRepository);

  return lockCardUseCase;
}
