import { AppError, IRequest } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";
import { IdezAuthService } from "@/service/idez/auth";

export async function authenticateIndividualByWallet(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.sub;

    if (!userId) throw new AppError({ message: "User not found" });

    const wallet = await prisma.graphicAccount.findFirst({
      where: { id: userId },
    });

    if (!wallet) throw new AppError({ message: "User not found" });

    const user = await prisma.user.findFirst({
      where: { id: wallet.id_master_user || "" },
    });

    if (!user) throw new AppError({ message: "User not found" });

    const [walletTransactions] = await prisma.graphicAccountTransaction.groupBy(
      {
        by: ["graphic_account_id"],
        where: {
          status: "waiting",
          GraphicAccount: {
            user_id: user.id,
          },
        },
        _sum: {
          amount: true,
        },
      },
    );

    const [balanceGraphic] = await prisma.graphicAccount.groupBy({
      by: ["user_id"],
      where: {
        user_id: user.id,
      },
      _sum: {
        balance: true,
      },
    });

    const response = await new IdezAuthService().execute({
      password: "",
      withoutPass: true,
      document: user.document,
      account: user.refId,
      access_token: user.access_token,
    });

    const userAccount = await prisma.account.findFirst({
      where: { user_id: user.id },
    });

    const account = {
      ...userAccount,
      status: response.account.status,
      //balance: response.account.balance,
      graphic_balance: balanceGraphic?._sum.balance,
      graphic_transactions: walletTransactions?._sum.amount,
    };

    const token = await reply.jwtSign(
      {
        role: user.role,
        type: user.role,
      },
      {
        sign: {
          sub: user.id,
          expiresIn: "30d",
        },
      },
    );

    const isGraphicAccountMember = await prisma.graphicAccount.findFirst({
      where: {
        id_master_user: user.id,
      },
    });

    const data = {
      user: {
        ...user,
        access_token: undefined,
        status: response.account.status,
        idMasterUser: isGraphicAccountMember ? true : false,
      },
      account: account,
      token,
    };

    return reply.status(200).send(data);
  } catch (error) {
    console.error(error);

    throw new AppError(error as unknown as IRequest);
  }
}
