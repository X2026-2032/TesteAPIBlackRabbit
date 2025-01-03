// accountsUseCase.ts
import { PrismaClient } from "@prisma/client";

export class AccountsUseCase {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async execute(
    accountId: string,
    newPin: string,
    newSecurityEletronic: string,
  ) {
    if (!accountId) {
      throw new Error("Invalid accountId");
    }

    const account = await this.prisma.account.findFirst({
      where: { id: accountId },
      select: { pin: true, security_eletronic: true },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    if (!account.pin) {
      // If the 'pin' column is empty or null, update it with the newPin
      await this.prisma.account.update({
        where: { id: accountId },
        data: { pin: newPin },
      });
    } else if (account.pin !== newPin) {
      // If 'pin' is not null and different from newPin, return an error
      throw new Error("Invalid PIN");
    }

    // Check if newSecurityEletronic has exactly 8 digits
    if (newSecurityEletronic.length !== 8) {
      throw new Error(
        "Invalid security_eletronic: it must have exactly 8 digits",
      );
    }

    // Atualiza security_eletronic independentemente do seu valor
    await this.prisma.account.update({
      where: { id: accountId },
      data: { security_eletronic: newSecurityEletronic },
    });
  }
}
