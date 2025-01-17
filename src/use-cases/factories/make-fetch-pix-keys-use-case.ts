import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { FetchPixKeysUseCase } from "../fetch-pix-key";

export function makeFetchPixKeysCase() {
  return new FetchPixKeysUseCase(new PrismaGraphicAccountUsersRepository());
}
