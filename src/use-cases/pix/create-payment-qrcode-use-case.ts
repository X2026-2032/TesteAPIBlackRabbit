import { prisma } from "@/lib/prisma";
import { AppError } from "../errors/app-error";
import { api } from "@/lib/axios";
import { v4 as uuidv4 } from "uuid";

type CreatePaymentPixQrCodeUseCaseRequest = {
  user_id: string;
  qr_code_id: string;
  amount: number;
};

type CreatePaymentPixQrCodeUseCaseResponse = {
  data: {
    data: {
      payment_document_id: string;
      scheduled_at: string;
    };
  };
};

export class CreatePaymentPixQrCodeUseCase {
  constructor() {}

  async execute(
    input: CreatePaymentPixQrCodeUseCaseRequest,
  ): Promise<CreatePaymentPixQrCodeUseCaseResponse> {
    try {
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

      const account = await prisma.account.findFirst({
        where: {
          id: graphic.account_id,
        },
      });

      if (!account) {
        throw new AppError({ message: "Account not found" });
      }

      const transaction = await this.sendRequestOfPayment(
        input,
        graphic.virtual_account_id,
      );

      const latestTransaction =
        await prisma.graphicAccountTransaction.findFirst({
          orderBy: {
            created_at: "desc",
          },
          select: {
            number_of_transaction: true,
          },
        });

      const accountTransaction = await prisma.accountTransaction.create({
        data: {
          amount: input.amount / 100,
          data: transaction.data.data,
          direction: "out",
          type: "PIX_COPY_AND_PASTE",
          account_id: account.id,
          status: "PENDING",
          description: "Pagamento Pix",
          previousValue: graphic.balance,
          newValue: graphic.balance - input.amount / 100,
          number_of_transaction: latestTransaction?.number_of_transaction
            ? latestTransaction.number_of_transaction + 1
            : 1,
          idempotency_id: transaction.data.data.payment_document_id,
        },
      });

      await prisma.graphicAccountTransaction.create({
        data: {
          amount: input.amount / 100,
          data: transaction.data,
          direction: "out",
          type: "PIX_COPY_AND_PASTE",
          graphic_account_id: graphic.id,
          status: "PENDING",
          description: "Pagamento Pix",
          previousValue: graphic.balance,
          newValue: graphic.balance - input.amount / 100,
          number_of_transaction: latestTransaction?.number_of_transaction
            ? latestTransaction.number_of_transaction + 1
            : 1,
          transaction_id: transaction.data.data.payment_document_id,
        },
      });

      await prisma.graphicAccount.update({
        where: {
          id: graphic.id,
        },
        data: {
          balance: graphic.balance - input.amount / 100,
        },
      });

      return transaction;
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  private async sendRequestOfPayment(
    input: CreatePaymentPixQrCodeUseCaseRequest,
    virtual_account_id: string,
  ): Promise<CreatePaymentPixQrCodeUseCaseResponse> {
    try {
      return await api.post(
        "/banking/cashout/pix",
        {
          amount: input.amount,
          pix_ref_id: input.qr_code_id,
          pix_ref_type: "brcode",
          virtual_account_id,
          external_id: uuidv4(),
        },
        {
          auth: {
            username: process.env.AUTH_USERNAME || "",
            password: process.env.AUTH_PASSWORD || "",
          },
        },
      );
    } catch (error: any) {
      throw new AppError({ message: "Falha ao pagar o pix copia e cola" });
    }
  }
}
