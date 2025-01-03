import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { ConfirmPixKeyUseCase } from "../confirm-pix-key";

export function makeConfirmPixKeyUseCase() {
  return new ConfirmPixKeyUseCase(new PrismaUsersRepository());
}
