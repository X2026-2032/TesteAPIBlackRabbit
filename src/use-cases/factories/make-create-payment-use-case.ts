import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { CreatePaymentUseCase } from "../create-payment";

export function makeCreatePaymentUseCase() {
  const usersRepository = new PrismaUsersRepository();

  const createPaymentUseCase = new CreatePaymentUseCase(usersRepository);

  return createPaymentUseCase;
}
