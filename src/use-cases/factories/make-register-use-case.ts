import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { RegisterIndividualsUseCase } from "../register-individuals/register-individuals";

export function makeRegisterUseCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();
  const registerIndividualsUseCase = new RegisterIndividualsUseCase(
    usersRepository,
  );

  return registerIndividualsUseCase;
}
