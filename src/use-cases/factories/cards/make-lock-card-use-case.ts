import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { PrismaCardsRepository } from "@/repositories/prisma/prisma-cards-repository";
import { LockCardUseCase } from "@/use-cases/cards/lock-card";

export function makeLockCardUseCase() {
  const repository = new PrismaCardsRepository();
  const usersRepository = new PrismaUsersRepository();
  const lockCardUseCase = new LockCardUseCase(repository, usersRepository);

  return lockCardUseCase;
}
