import { PrismaPhoneRechargeRepository } from "@/repositories/prisma/prisma-phone-recharge-repository";
import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { FinishRechargeUseCase } from "@/use-cases/phone_recharge/finish-recharge-use-case";

export function makeFinishRechargeUseCase(): FinishRechargeUseCase {
  const repository = new PrismaPhoneRechargeRepository();
  const usersRepository = new PrismaGraphicAccountUsersRepository();
  return new FinishRechargeUseCase(repository, usersRepository);
}
