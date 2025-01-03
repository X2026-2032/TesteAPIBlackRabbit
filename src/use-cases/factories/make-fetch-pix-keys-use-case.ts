import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { FetchPixKeysUseCase } from "../fetch-pix-key";

export function makeFetchPixKeysCase() {
  return new FetchPixKeysUseCase(new PrismaUsersRepository());
}
