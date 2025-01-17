import { api, requestError } from "@/lib/axios";
import { UsersRepository } from "@/repositories/users-messenger-respository";
import { AppError } from "./errors/app-error";
import { prisma } from "@/lib/prisma";
import { GraphicAccount, GraphicAccountTransaction } from "@prisma/client";

interface FetchTransactionsByIdUseCaseRequest {
  userId: string;
  id?: string;
}

export class FetchTransactionsByIdUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId, id }: FetchTransactionsByIdUseCaseRequest) {
    const user = await this.usersRepository.findById(userId);
    let token = user?.access_token;

    const graphic = await prisma.graphicAccount.findUnique({
      where: {
        id: userId,
      },
      include: {
        user: true,
      },
    });

    if (graphic) {
      token = graphic.user.access_token;

      const transaction = await prisma.graphicAccountTransaction.findUnique({
        where: {
          id,
        },
      });
      if (!transaction)
        throw new AppError(requestError("Transação não encontrada"));
      return TransactionsGraphicBuild.transactions(transaction, graphic);
    }

    if (user) {
    }

    try {
      const { data } = await api.get(`/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        transaction: { data, user },
      };
    } catch (err) {
      throw new AppError(requestError(err));
    }
  }
}

export class TransactionsGraphicBuild {
  static transactions(
    transaction: GraphicAccountTransaction,
    graphic: GraphicAccount,
  ) {
    const detail = TransactionsGraphicBuildFactory.factory(transaction);
    return {
      transaction: {
        data: {
          ...detail,
          ...transaction,
        },
        user: {
          name: graphic.name,
          document: graphic.document,
        },
      },
    };
  }
}
export class TransactionsGraphicBuildFactory {
  static factory(transaction: GraphicAccountTransaction) {
    if (transaction.type === "phone_recharges") {
      return TransactionsGraphicBuildFactory.phoneRecharges(transaction);
    }
    return TransactionsGraphicBuildFactory.pixTedBoletoPayments(transaction);
  }
  static phoneRecharges(transaction: GraphicAccountTransaction) {
    const data: {
      dealer_code: string;
      area_code: string;
      phone_number: string;
    } = transaction.data as any;
    const bank_account = {
      name: "Recarga",
      bank_name: data.dealer_code,
      document: `${data.area_code} ${data.phone_number}`,
    };
    return TransactionsGraphicBuildFactory.detail("Recarga", bank_account);
  }
  static pixTedBoletoPayments(transaction: GraphicAccountTransaction) {
    const response: {
      payer_payee: {
        bank_account: {
          name: string;
          document: string;
          bank_name: string;
        };
      };
    } = transaction.response as any;

    const bank_account = {
      name: response.payer_payee.bank_account.name,
      document: response.payer_payee.bank_account.document,
      bank_name: response.payer_payee.bank_account.bank_name,
    };
    return TransactionsGraphicBuildFactory.detail(
      transaction.type,
      bank_account,
    );
  }
  static detail(
    title: string,
    bank_account: { name: string; document: string; bank_name: string },
  ) {
    return {
      title,
      detail: {
        payer_payee: {
          bank_account,
        },
      },
    };
  }
}
