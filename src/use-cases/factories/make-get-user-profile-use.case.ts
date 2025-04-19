import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { GetUserProfileUseCase } from "../get-user-profile";

export function makeGetUserProfileUseCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();
  const factory = new GetUserProfileUseCase(usersRepository as any);

  return factory;
}
