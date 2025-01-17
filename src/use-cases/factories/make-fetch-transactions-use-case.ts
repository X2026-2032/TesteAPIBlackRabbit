import { FetchBackofficeTransactionsUseCase } from "../backoffice/fetch-transactions";
import { GetTransactionsUseCase } from "../get-transactions";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";

export function makeFetchTransactionsCase() {
  const usersRepository = new PrismaUsersRepository();
  const fetchTransactionsUseCase = new GetTransactionsUseCase(usersRepository);

  return fetchTransactionsUseCase;
}

export function makeFetchackofficeTransactionsCase() {
  const usersRepository = new PrismaUsersRepository();

  const fetchTransactionsUseCase = new FetchBackofficeTransactionsUseCase(
    usersRepository,
  );

  return fetchTransactionsUseCase;
}
