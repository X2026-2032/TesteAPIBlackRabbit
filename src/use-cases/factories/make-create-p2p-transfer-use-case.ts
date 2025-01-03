import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { CreateP2pTransferUseCase } from "../create-p2p-transfer";

export function makeCreateP2pTransferUseCase() {
  const usersRepository = new PrismaUsersRepository();

  const createP2pTransferUseCase = new CreateP2pTransferUseCase(
    usersRepository,
  );

  return createP2pTransferUseCase;
}
