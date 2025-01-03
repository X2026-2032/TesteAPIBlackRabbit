import { prisma } from "@/lib/prisma";
import { api } from "@/lib/axios";
import { AppError } from "../errors/app-error";
import { getMaxNumberOfTransactionByAccountTransactions } from "@/utils";

type CreatePaymentPixUseCaseRequest = {
  user_id: string;
  amount: number;
  key: string;
};

type CreatePaymentPixUseCaseResponse = {
  data: {
    data: {
      payment_document_id: string;
      scheduled_at: string;
    };
  };
};

export class CreatePaymentPixUseCase {
  constructor() {}
  public async execute(
    input: CreatePaymentPixUseCaseRequest,
  ): Promise<CreatePaymentPixUseCaseResponse> {
    const graphic = await prisma.graphicAccount.findFirst({
      where: {
        id: input.user_id,
      },
    });

    if (!graphic) {
      throw new AppError({ message: "Graphic account not found" });
    }

    if (!graphic.virtual_account_id) {
      throw new AppError({ message: "virtual_account_id is not defined" });
    }

    if (graphic.balance < input.amount / 100) {
      throw new AppError({ message: "Insufficient balance" });
    }

    const latestTransaction = await prisma.graphicAccountTransaction.findFirst({
      orderBy: {
        created_at: "desc",
      },
      select: {
        number_of_transaction: true,
      },
    });

    const transaction = await this.sendRequestOfPayment(
      input,
      graphic.virtual_account_id,
    );

    await prisma.graphicAccountTransaction.create({
      data: {
        data: {},
        status: "PENDING",
        graphic_account_id: graphic.id,
        amount: input.amount / 100,
        number_of_transaction: latestTransaction?.number_of_transaction
          ? latestTransaction.number_of_transaction + 1
          : 1,
        direction: "out",
        newValue: graphic.balance - input.amount / 100,
        previousValue: graphic.balance,
        type: "PIX_MANUAL",
        transaction_id: transaction.data.data.payment_document_id,
        user_id: graphic.user_id,
      },
    });

    await prisma.graphicAccount.update({
      where: {
        id: graphic.id,
      },
      data: {
        balance: graphic?.balance! - input.amount / 100,
      },
    });

    return transaction;
  }

  private async sendRequestOfPayment(
    input: CreatePaymentPixUseCaseRequest,
    virtual_account_id: string,
  ): Promise<CreatePaymentPixUseCaseResponse> {
    try {
      return await api.post(
        "/banking/cashout/pix/v2",
        {
          amount: input.amount,
          reference: input.key,
          type: "key",
          virtual_account_id,
        },
        {
          auth: {
            username: process.env.AUTH_USERNAME || "",
            password: process.env.AUTH_PASSWORD || "",
          },
        },
      );
    } catch (error: any) {
      throw new AppError({
        message: "Falha ao pagar o pix",
      });
    }
  }
}
