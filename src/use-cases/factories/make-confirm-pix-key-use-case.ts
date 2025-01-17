import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { ConfirmPixKeyUseCase } from "../confirm-pix-key";

export function makeConfirmPixKeyUseCase() {
  return new ConfirmPixKeyUseCase(new PrismaUsersRepository());
}
