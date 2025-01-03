import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { fetchBalanceEndNight } from "./balanceService";

export const nightlyBalanceUpdate = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const balances = await prisma.dailyFinalBalance.findMany({
      include: {
        Account: true,
        GraphicAccount: true,
      },
    });

    const filterAccount = balances.filter((balance) => {
      return balance.accountId;
    });
    const filterGraphic = balances.filter((balance) => {
      return balance.graphicAccountId;
    });

    for (const balance of filterAccount) {
      if (balance.accountId && balance.Account && balance.Account.api_key) {
        const daily = balance.dailyBalances as unknown as Array<{
          createdAt: Date;
          amount: number;
        }>;

        const alreadyExistsToday = daily.some((entry) => {
          const entryDate = new Date(entry.createdAt)
            .toISOString()
            .split("T")[0];
          return entryDate === today;
        });

        if (!alreadyExistsToday) {
          const response = await fetchBalanceEndNight(
            balance.accountId,
            balance.Account.api_key,
          );
          const amount = response.amountAvailable;
          daily.push({ amount, createdAt: new Date() });
          await prisma.dailyFinalBalance.update({
            where: {
              id: balance.id,
            },
            data: {
              dailyBalances: daily,
            },
          });
        }
      }
    }
    for (const balance of filterGraphic) {
      if (
        balance.graphicAccountId &&
        balance.GraphicAccount &&
        balance.GraphicAccount.virtual_account_id
      ) {
        const daily = balance.dailyBalances as unknown as Array<{
          createdAt: Date;
          amount: number;
        }>;

        const alreadyExistsToday = daily.some((entry) => {
          const entryDate = new Date(entry.createdAt)
            .toISOString()
            .split("T")[0];
          return entryDate === today;
        });

        if (!alreadyExistsToday) {
          const response = await fetchBalanceEndNight(
            balance.graphicAccountId,
            balance.GraphicAccount.virtual_account_id,
          );
          const amount = response.amountAvailable;
          daily.push({ amount, createdAt: new Date() });
          await prisma.dailyFinalBalance.update({
            where: {
              id: balance.id,
            },
            data: {
              dailyBalances: daily,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
};

// Define the cron job to run the async function at 11:45 PM every night
cron.schedule("15 00 * * *", nightlyBalanceUpdate);
