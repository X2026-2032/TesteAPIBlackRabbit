import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { RegisterPixKeyUseCase } from "../register-pix-key";

export function makeRegisterPixKeyUseCase() {
  return new RegisterPixKeyUseCase(new PrismaUsersRepository());
}
