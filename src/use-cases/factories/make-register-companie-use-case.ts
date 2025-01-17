import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { RegisterCompaniesUseCase } from "../register-companie";

export function makeRegisterCompanieUseCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();
  const registerCompanieUseCase = new RegisterCompaniesUseCase(usersRepository);

  return registerCompanieUseCase;
}
