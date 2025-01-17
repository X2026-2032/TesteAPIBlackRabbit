import { FetchBackofficeTransactionsUseCase } from "../backoffice/fetch-transactions";
import { GetTransactionsUseCase } from "../get-transactions";
import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";

export function makeFetchTransactionsCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();
  const fetchTransactionsUseCase = new GetTransactionsUseCase(usersRepository);

  return fetchTransactionsUseCase;
}

export function makeFetchackofficeTransactionsCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();

  const fetchTransactionsUseCase = new FetchBackofficeTransactionsUseCase(
    usersRepository,
  );

  return fetchTransactionsUseCase;
}
