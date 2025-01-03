import { AppError, IRequest } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";

export async function authenticateWallet(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.sub;

    if (!userId) throw new AppError({ message: "User not found" });

    const wallet = await prisma.graphicAccount.findFirst({
      where: { id_master_user: userId },
    });

    if (!wallet) throw new AppError({ message: "Wallet not found" });

    const address = await prisma.address.findFirst({
      where: {
        graphicId: wallet.id,
      },
    });

    const [walletTransactions] = await prisma.graphicAccountTransaction.groupBy(
      {
        by: ["graphic_account_id"],
        where: {
          status: "waiting",
          GraphicAccount: {
            user_id: wallet.user_id,
          },
        },
        _sum: {
          amount: true,
        },
      },
    );

    const account = {
      ...wallet,
      graphic_balance: 0,
      graphic_transactions: walletTransactions?._sum.amount,
    };

    const user = {
      ...(wallet as any),
      address,
      type: wallet.role || "WALLET",
      role: wallet.role || "WALLET",
    };

    const token = await reply.jwtSign(
      {
        role: wallet.role,
        type: wallet.role,
      },
      {
        sign: {
          sub: wallet.id,
          expiresIn: "30d",
        },
      },
    );

    const data = {
      user: { ...user, access_token: undefined },
      account: account,
      token,
    };

    return reply.status(200).send(data);
  } catch (error) {
    console.error(error);

    throw new AppError(error as unknown as IRequest);
  }
}
