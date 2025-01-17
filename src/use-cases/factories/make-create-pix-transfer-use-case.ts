import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { CreatePixTransferUseCase } from "../create-pix-transfer";

export function makeCreatePixTransferUseCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();

  const createPixTransferUseCase = new CreatePixTransferUseCase(
    usersRepository,
  );

  return createPixTransferUseCase;
}
