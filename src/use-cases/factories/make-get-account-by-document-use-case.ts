import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { GetAccountByDocumentUseCase } from "../get-account-by-document";

export function makeGetAccountByDocumentUseCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();

  const getAccountByDocumentUseCase = new GetAccountByDocumentUseCase(
    usersRepository,
  );

  return getAccountByDocumentUseCase;
}
