import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface DailyFinalBalance {
  dailyBalances: {
    createdAt: Date;
    amount: number;
  }[];
}

export const dailyFinalBalanceRepository = {
  findAll: async (userId: string): Promise<DailyFinalBalance[]> => {
    try {
      //  console.log('User ID:', userId);

      //  console.log('Finding user...');
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { Account: true, GraphicAccount: true },
      });

      // console.log('User:', user);

      let accountId: string | undefined;

      // Verifica se o usuário existe e se possui uma conta
      if (user && user.Account && user.Account.length > 0) {
        accountId = user.Account[0]?.id;
      }

      // Se o usuário não tiver uma conta, tenta buscar o graphicAccountId
      if (!accountId) {
        //    console.log('Finding graphic account...');
        const isWallet = await prisma.graphicAccount.findUnique({
          where: { id: userId },
          include: { _count: true },
        });

        // console.log('isWallet:', isWallet);

        accountId = isWallet?.id;
      }
      //console.log('isWallet accountId:', accountId)

      if (!accountId) {
        //  console.error('No account found for the user');
        throw new Error("No account found for the user");
      }

      //  console.log('Finding daily final balances...');
      const accountDailyFinalBalances = await prisma.dailyFinalBalance.findMany(
        {
          where: {
            OR: [{ accountId: accountId }, { graphicAccountId: accountId }],
          },
          select: {
            dailyBalances: true,
          },
        },
      );

      const formattedBalances = accountDailyFinalBalances.map((balance) => ({
        dailyBalances: Array.isArray(balance.dailyBalances)
          ? balance.dailyBalances.map((dailyBalance: any) => ({
              createdAt: dailyBalance.createdAt,
              amount: parseFloat(dailyBalance.amount),
            }))
          : [],
      }));

      //  console.log('Daily final balances found:', formattedBalances);

      return formattedBalances;
    } catch (error) {
      // console.error('Failed to retrieve daily final balances from the database:', error);
      throw new Error(
        "Failed to retrieve daily final balances from the database",
      );
    }
  },
};
