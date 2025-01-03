import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { RegisterCompaniesUseCase } from "../register-companie";

export function makeRegisterCompanieUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const registerCompanieUseCase = new RegisterCompaniesUseCase(usersRepository);

  return registerCompanieUseCase;
}
