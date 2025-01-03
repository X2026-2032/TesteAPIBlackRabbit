import { AppError } from "../errors/app-error";
import { makeGetUserProfileUseCase } from "../factories/make-get-user-profile-use.case";
import { prisma } from "@/lib/prisma";

export const SELECT_TRANSACTIONS = {
  id: true,
  data: true,
  type: true,
  status: true,
  response: true,
  amount: true,
  direction: true,
  description: true,
  created_at: true,
  previousValue: true,
  newValue: true,
  order_id: true,
  ReportBalance: true,
  number_of_transaction: true,
};

export class GetTransactios {
  public async accountTransaction(
    userId: string,
    queryParams: any,
    select = SELECT_TRANSACTIONS,
  ) {
    const getUserProfile = makeGetUserProfileUseCase();
    const account = await prisma.accountUsers.findFirst({
      where: {
        user_id: userId,
      },
    });
    if (!account) {
      throw new Error("Conta não cadastrada");
    }

    const transactions = await prisma.accountTransaction.findMany({
      where: {
        ...queryParams.where,
        account_id: account.account_id,
      },
      select,
      orderBy: {
        created_at: "desc",
      },

      skip: queryParams.page * queryParams.per_page,
      take: queryParams.per_page,
    });

    const { user } = await getUserProfile.execute({ userId });
    const transactionsFinal = transactions.map((item) => {
      return { ...item, user };
    });
    const total = transactionsFinal.length;
    return {
      total,
      transactions: transactionsFinal,
    };
  }

  public async getGraphicAccountTransaction(
    queryParams: any,
    select = SELECT_TRANSACTIONS,
  ) {
    const transactions = await prisma.graphicAccountTransaction.findMany({
      where: {
        ...queryParams.where,
      },
      include: {
        GraphicAccount: {
          select: {
            id: true,
            name: true,
            document: true,
            number_identifier: true,
          },
        },
        ReportBalance: true,
      },
      orderBy: {
        created_at: "desc",
      },
      skip: queryParams.page * queryParams.per_page,
      take: queryParams.per_page,
    });
    const total = await prisma.graphicAccountTransaction.count({
      where: {
        ...queryParams.where,
      },
    });

    return {
      total,
      transactions,
    };
  }
  public async listAllUserTransactions(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) return new AppError({ message: "User not found", status: 404 });

    // talvez seja desnecessario em producao
    if (!user.api_key)
      return new AppError({ message: "api_key is missing", status: 500 });
  }
}
