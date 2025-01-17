import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { BackofficeAuthenticateUseCase } from "@/use-cases/auth/backoffice-authenticate";

export function makeBackofficeAuthenticateUseCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();

  const backofficeAuthenticateUseCase = new BackofficeAuthenticateUseCase(
    usersRepository,
  );

  return backofficeAuthenticateUseCase;
}
