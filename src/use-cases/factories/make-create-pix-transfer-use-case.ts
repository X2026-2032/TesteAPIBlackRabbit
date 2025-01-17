import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { CreatePixTransferUseCase } from "../create-pix-transfer";

export function makeCreatePixTransferUseCase() {
  const usersRepository = new PrismaUsersRepository();

  const createPixTransferUseCase = new CreatePixTransferUseCase(
    usersRepository,
  );

  return createPixTransferUseCase;
}
