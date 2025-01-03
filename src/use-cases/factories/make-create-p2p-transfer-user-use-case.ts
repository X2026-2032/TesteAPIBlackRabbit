import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { CreateP2pTransferUseCaseUser } from "../create-p2p-transfer-user";

export function makeCreateP2pTransferUseCaseUser() {
  const usersRepository = new PrismaUsersRepository();

  const createP2pTransferUseCase = new CreateP2pTransferUseCaseUser(
    usersRepository,
  );

  return createP2pTransferUseCase;
}
