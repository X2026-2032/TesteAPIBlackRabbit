import { PrismaPhoneRechargeRepository } from "@/repositories/prisma/prisma-phone-recharge-repository";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { FinishRechargeUseCase } from "@/use-cases/phone_recharge/finish-recharge-use-case";

export function makeFinishRechargeUseCase(): FinishRechargeUseCase {
  const repository = new PrismaPhoneRechargeRepository();
  const usersRepository = new PrismaUsersRepository();
  return new FinishRechargeUseCase(repository, usersRepository);
}
