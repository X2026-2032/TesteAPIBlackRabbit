import { PrismaClient } from "@prisma/client";

export class SeedAccount {
  constructor(private readonly prisma: PrismaClient) {}

  public async execute() {
    const document = "39778028000190";
    const refId = "a561e290-dc7e-45f9-b067-09d1faa6cf65";
    const users = await this.prisma.user.findFirst({
      where: {
        document,
      },
      select: {
        id: true,
      },
    });
    if (!users) return;

    const account = await this.prisma.account.findFirst({
      where: {
        user_id: users.id,
      },
    });
    if (account) return;

    const accounts = await this.prisma.account.create({
      data: {
        refId,
        user_id: users.id,
      },
    });

    await this.prisma.accountUsers.create({
      data: {
        account_id: accounts.id,
        user_id: accounts.user_id,
      },
    });

    await this.prisma.accountToken.create({
      data: {
        account_id: accounts.id,
        access_token: "token",
      },
    });
  }
}
