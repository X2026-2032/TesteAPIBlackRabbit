import { prisma } from "@/lib/prisma";

export class GetUsersAccountToken {
  static async execute(userId: string) {
    let account_id = "";
    const graphic = await prisma.graphicAccount.findUnique({
      where: {
        id: userId,
      },
      select: {
        account_id: true,
      },
    });
    if (graphic) {
      account_id = graphic.account_id;
    }
    const users = await prisma.accountUsers.findFirst({
      where: {
        user_id: userId,
      },
    });
    if (!users && !graphic) {
      throw new Error("Usuário não encontrado");
    }

    if (!graphic && users) {
      account_id = users.account_id;
    }
    return await prisma.accountToken.findFirst({
      where: {
        account_id,
      },
    });
  }
}
