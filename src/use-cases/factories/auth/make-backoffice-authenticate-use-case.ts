import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-backoffice-repository";
import { BackofficeAuthenticateUseCase } from "@/use-cases/auth/backoffice-authenticate";

export function makeBackofficeAuthenticateUseCase() {
  const usersRepository = new PrismaUsersRepository();

  const backofficeAuthenticateUseCase = new BackofficeAuthenticateUseCase(
    usersRepository,
  );

  return backofficeAuthenticateUseCase;
}
