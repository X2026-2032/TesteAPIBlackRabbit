import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { AuthenticateUseCase } from "../authenticate";

export function makeAuthenticateUseCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();
  const authenticateUseCase = new AuthenticateUseCase(
    usersRepository  );

  return authenticateUseCase;
}
