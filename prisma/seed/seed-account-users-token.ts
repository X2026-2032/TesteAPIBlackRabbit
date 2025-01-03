import { PrismaClient } from "@prisma/client";

export class SeedAccountUsersToken {
  constructor(private readonly prisma: PrismaClient) {}

  public async execute() {
    const users = await this.prisma.user.findMany({
      where: {
        role: "MEMBER",
      },
      select: {
        id: true,
      },
    });
    if (!users) return;

    const usersId = users.map((item) => item.id);
    const isUsers = await this.prisma.accountUsers.count({
      where: {
        user_id: {
          in: usersId,
        },
      },
    });
    if (isUsers) return;

    const accounts = await this.prisma.account.findMany({
      where: {
        user_id: {
          in: usersId,
        },
      },
      include: {
        user: true,
      },
    });

    await this.prisma.accountUsers.createMany({
      data: accounts.map((item) => ({
        account_id: item.id,
        user_id: item.user_id,
      })),
    });

    await this.prisma.accountToken.createMany({
      data: accounts.map((item) => ({
        account_id: item.id,
        access_token: item.user.access_token ?? "token",
      })),
    });
  }
}
