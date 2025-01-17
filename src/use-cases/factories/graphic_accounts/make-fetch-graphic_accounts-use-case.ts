import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { FetchGrapicAccountUseCase } from "@/use-cases/graphic_accounts/fetch-graphic_accounts";

export function makeFetchGrapicAccountUseCase() {
  const usersRepository = new PrismaUsersRepository();

  const fetchGrapicAccountUseCase = new FetchGrapicAccountUseCase(
    usersRepository,
  );

  return fetchGrapicAccountUseCase;
}
