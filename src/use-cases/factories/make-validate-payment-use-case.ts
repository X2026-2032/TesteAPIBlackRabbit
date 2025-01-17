import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { ValidatePaymentUseCase } from "../validate-payment";

export function makeValidatePaymentUseCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();

  const validatePaymentUseCase = new ValidatePaymentUseCase(usersRepository);

  return validatePaymentUseCase;
}
