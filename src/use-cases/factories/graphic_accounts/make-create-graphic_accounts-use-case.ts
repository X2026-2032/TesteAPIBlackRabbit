import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-graphicAccount-repository";
import { CreateGrapicAccountUseCase } from "@/use-cases/graphic_accounts/create-graphic_accounts";

export function makeCreateGrapicAccountUseCase() {
  const usersGraphicRepository = new PrismaGraphicAccountUsersRepository();

  const createGrapicAccountUseCase = new CreateGrapicAccountUseCase(
    usersGraphicRepository,
  );

  return createGrapicAccountUseCase;
}
