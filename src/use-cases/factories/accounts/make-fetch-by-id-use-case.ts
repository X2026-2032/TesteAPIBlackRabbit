import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { FetchByIdUseCase } from "@/use-cases/accounts/fetch-by-id";

export function makeFetchByIdUseCase() {
  const repository = new PrismaAccountsRepository();
  const fetchAccountsUseCase = new FetchByIdUseCase(repository);

  return fetchAccountsUseCase;
}
