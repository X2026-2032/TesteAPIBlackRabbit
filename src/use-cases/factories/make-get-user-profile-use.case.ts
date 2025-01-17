import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { GetUserProfileUseCase } from "../get-user-profile";

export function makeGetUserProfileUseCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();
  const accountsRepository = new PrismaAccountsRepository();
  const factory = new GetUserProfileUseCase(
    usersRepository,
    accountsRepository,
  );

  return factory;
}
