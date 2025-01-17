import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { FetchTransactionsByIdUseCase } from "../fetch-transactions-by-id";

export function makeFetchTransactionByIdCase() {
  const usersRepository = new PrismaUsersRepository();

  const result = new FetchTransactionsByIdUseCase(usersRepository);

  return result;
}
