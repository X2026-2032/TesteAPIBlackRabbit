import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { FetchAccountsUseCase } from "@/use-cases/accounts/fetch-accounts";

export function makeFetchAccountsUseCase() {
  const repository = new PrismaAccountsRepository();
  const fetchAccountsUseCase = new FetchAccountsUseCase(repository);

  return fetchAccountsUseCase;
}
