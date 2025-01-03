import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { ValidatePaymentUseCase } from "../validate-payment";

export function makeValidatePaymentUseCase() {
  const usersRepository = new PrismaUsersRepository();

  const validatePaymentUseCase = new ValidatePaymentUseCase(usersRepository);

  return validatePaymentUseCase;
}
