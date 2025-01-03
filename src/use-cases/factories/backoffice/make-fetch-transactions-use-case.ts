import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { FetchBackofficeTransactionsUseCase } from "@/use-cases/backoffice/fetch-transactions";

export function makeFetchBackofficeTransactionsCase() {
  const usersRepository = new PrismaUsersRepository();

  const fetchTransactionsUseCase = new FetchBackofficeTransactionsUseCase(
    usersRepository,
  );

  return fetchTransactionsUseCase;
}
