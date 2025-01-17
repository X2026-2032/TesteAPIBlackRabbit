import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { ValidatePixDecodeUseCase } from "../validate-pix-decode";

export function makeValidatePixDecodeUseCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();

  const validatePixDecodeUseCase = new ValidatePixDecodeUseCase(
    usersRepository,
  );

  return validatePixDecodeUseCase;
}
