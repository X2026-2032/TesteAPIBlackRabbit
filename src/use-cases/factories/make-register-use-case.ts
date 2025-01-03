import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { RegisterIndividualsUseCase } from "../register-individuals/register-individuals";

export function makeRegisterUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const registerIndividualsUseCase = new RegisterIndividualsUseCase(
    usersRepository,
  );

  return registerIndividualsUseCase;
}
