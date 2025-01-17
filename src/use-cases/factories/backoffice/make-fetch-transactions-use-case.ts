import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { FetchBackofficeTransactionsUseCase } from "@/use-cases/backoffice/fetch-transactions";

export function makeFetchBackofficeTransactionsCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();

  const fetchTransactionsUseCase = new FetchBackofficeTransactionsUseCase(
    usersRepository,
  );

  return fetchTransactionsUseCase;
}
