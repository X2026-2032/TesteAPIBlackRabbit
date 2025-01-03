import { PrismaPhoneRechargeRepository } from "@/repositories/prisma/prisma-phone-recharge-repository";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { PhoneRechargeUseCase } from "@/use-cases/phone_recharge/phone-recharge-use-case";

export function makePhoneRechargeUseCase() {
  const repository = new PrismaPhoneRechargeRepository();
  const usersRepositoryepository = new PrismaUsersRepository();
  return new PhoneRechargeUseCase(repository, usersRepositoryepository);
}
