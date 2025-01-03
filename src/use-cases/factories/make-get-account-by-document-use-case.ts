import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { GetAccountByDocumentUseCase } from "../get-account-by-document";

export function makeGetAccountByDocumentUseCase() {
  const usersRepository = new PrismaUsersRepository();

  const getAccountByDocumentUseCase = new GetAccountByDocumentUseCase(
    usersRepository,
  );

  return getAccountByDocumentUseCase;
}
