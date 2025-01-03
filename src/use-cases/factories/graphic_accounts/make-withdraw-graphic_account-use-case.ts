import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { WithdrawGrapicAccountUseCase } from "@/use-cases/graphic_accounts/withdraw-graphic_account";

export function makeWithdrawGrapicAccountUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const accountsRepository = new PrismaAccountsRepository();

  const withdrawGrapicAccountUseCase = new WithdrawGrapicAccountUseCase(
    usersRepository,
    accountsRepository,
  );

  return withdrawGrapicAccountUseCase;
}
