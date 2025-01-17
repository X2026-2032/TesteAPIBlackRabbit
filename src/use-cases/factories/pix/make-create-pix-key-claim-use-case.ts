import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { CreatePixKeyClaimUseCase } from "@/use-cases/pix/create-pix-key-claim-use-case";

export function makeCreatePixKeyClaimUseCase(): any {
  const usersRepository = new PrismaUsersRepository();
  return new CreatePixKeyClaimUseCase(usersRepository);
}
