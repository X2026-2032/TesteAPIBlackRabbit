import { prisma } from "@/lib/prisma";
import {
  TransactionsParams,
  TransactionsQueryParams,
} from "@/utils/transaction-query-params";

interface FetchProcessPaymentsUseCaseRequest {
  userId: string;
  graphic_id: string;
}

export class FetchGraphicTransactionsById {
  async execute(
    { userId, graphic_id }: FetchProcessPaymentsUseCaseRequest,
    params: Partial<TransactionsParams>,
  ) {
    const queryParams = TransactionsQueryParams.params(params);

    const graphicAccount = await prisma.graphicAccount.findFirst({
      where: {
        id: graphic_id,
        user_id: userId,
      },
    });

    const transactions = await prisma.graphicAccountTransaction.findMany({
      where: {
        ...queryParams.where,
        graphic_account_id: graphic_id,
      },
      orderBy: {
        created_at: "desc",
      },
      skip: queryParams.page,
      take: queryParams.per_page,
    });

    return {
      ...graphicAccount,
      transactions,
      password_hash: undefined,
    };
  }
}
