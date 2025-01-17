import { PrismaAccountsRepository } from "@/repositories/prisma/prisma-accounts-repository";
import { PrismaGraphicAccountUsersRepository } from "@/repositories/prisma/prisma-users-messenger-repository";
import { WithdrawGrapicAccountUseCase } from "@/use-cases/graphic_accounts/withdraw-graphic_account";

export function makeWithdrawGrapicAccountUseCase() {
  const usersRepository = new PrismaGraphicAccountUsersRepository();
  const accountsRepository = new PrismaAccountsRepository();

  const withdrawGrapicAccountUseCase = new WithdrawGrapicAccountUseCase(
    usersRepository,
    accountsRepository,
  );

  return withdrawGrapicAccountUseCase;
}
