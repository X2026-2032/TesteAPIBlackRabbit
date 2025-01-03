import { prisma } from "@/lib/prisma";
import { AppError } from "../errors/app-error";

type GetBalanceRequest = {
  user_id: string;
};

type GetBalanceResponse = {
  balanceToTransfer: number;
  netBalance: number;
  balance: number;
};

export class GetBalanceteUseCase {
  constructor() {}

  async execute(input: GetBalanceRequest): Promise<GetBalanceResponse> {
    try {
      const account = await prisma.account.findFirst({
        where: {
          user_id: input.user_id,
        },
        select: {
          id: true,
          balance: true,
        },
      });

      if (!account?.id && !account?.balance) {
        throw new AppError({
          message: "Conta não encontrada",
        });
      }

      const graphic = await prisma.graphicAccount.findMany({
        where: {
          account_id: account?.id,
        },
        select: {
          id: true,
        },
      });

      const machinesIds = await prisma.pagBankCardMachine.findMany({
        where: {
          graphic_account_id: {
            in: graphic.map((item) => item.id),
          },
        },
      });

      const machinesTransactions = await prisma.pagBankTransaction.findMany({
        where: {
          AND: [
            {
              machineId: {
                in: machinesIds.map((item) => item.id),
              },
              status: 4,
              isAwaitingTransfer: true,
            },
          ],
        },
        select: {
          netAmount: true,
        },
      });

      const balanceToTransfer = machinesTransactions.reduce((acc, item) => {
        return acc + item.netAmount;
      }, 0);

      const netBalance = account?.balance! - balanceToTransfer;

      return {
        balanceToTransfer,
        netBalance,
        balance: account?.balance!,
      };
    } catch (error) {
      throw new AppError({
        message: "Falha ao buscar o balancete",
      });
    }
  }
}
