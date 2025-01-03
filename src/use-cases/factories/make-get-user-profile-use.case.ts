import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { GetUserProfileUseCase } from "../get-user-profile";

export function makeGetUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const accountsRepository = new PrismaAccountsRepository();
  const factory = new GetUserProfileUseCase(
    usersRepository,
    accountsRepository,
  );

  return factory;
}
