import { PrismaPhoneRechargeRepository } from "@/repositories/prisma/prisma-phone-recharge-repository";
import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { PhoneRechargeUseCase } from "@/use-cases/phone_recharge/phone-recharge-use-case";

export function makePhoneRechargeUseCase() {
  const repository = new PrismaPhoneRechargeRepository();
  const usersRepositoryepository = new PrismaGraphicAccountUsersRepository();
  return new PhoneRechargeUseCase(repository, usersRepositoryepository);
}
