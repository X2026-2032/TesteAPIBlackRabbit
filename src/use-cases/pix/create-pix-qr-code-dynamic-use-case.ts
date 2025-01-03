import { api, requestError } from "@/lib/axios";
import { UsersRepository } from "@/repositories/users-respository";
import { GetUsersAccountToken } from "../get-users-account-token";
import { AppError } from "../errors/app-error";
import { prisma } from "@/lib/prisma";
import { Account, GraphicAccount } from "@prisma/client";
import { getMaxNumberOfTransactionByAccountTransactions } from "@/utils";
import { v4 as uuidv4 } from "uuid";

type QrCodeDynamicGenerateResponse = {
  data: {
    data: {
      allow_change_the_amount_on_payment: boolean;
      amount: {
        amount: number;
        currency: string;
      };
      bank_account_id: string;
      counterparty_bank_accounts: [] | null;
      counterparty_id: string;
      description: string | null;
      entity_id: string;
      expiration_datetime: string;
      external_id: string | null;
      hash: string;
      id: string;
      pix_key_id: string;
      status: string;
      timestamp: string;
      virtual_account_id: string;
    };
  };
};

export type CounterPartyType = {
  name: string;
  tax_number: string;
};

export type QrCodeOptions = {
  allow_change_the_amount_on_payment: boolean;
  show_qrcode_image: boolean;
};

interface PixQrCodeDynamicCaseRequest {
  userId: string;
  description: string;
  amount: number;
  counterparty: CounterPartyType;
  date_expiration?: string;
  options: QrCodeOptions;
  virtual_account_id: string;
}

export class PixQrCodeDynamicUseCase {
  private readonly usersRepository: UsersRepository;

  constructor(usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

  public async execute(input: PixQrCodeDynamicCaseRequest) {
    const [token, user] = await Promise.all([
      GetUsersAccountToken.execute(input.userId),
      this.usersRepository.findById(input.userId),
    ]);

    if (!token) {
      throw new Error("Usuário inválido");
    }

    let graphAccount: GraphicAccount | null = null;

    let api_key;

    let account: Account | null = null;

    if (!user) {
      graphAccount = await prisma.graphicAccount.findFirst({
        where: { id: input.userId },
      });

      if (graphAccount) {
        account = await prisma.account.findFirst({
          where: { id: graphAccount.account_id },
        });
        api_key = graphAccount.bank_account_id;
      }
    } else {
      account = await prisma.account.findFirst({
        where: { refId: user.refId! },
      });
      api_key = user.api_key;
    }

    if (!api_key) {
      throw new Error("api_key não encontrado");
    }

    if (!graphAccount && !user) {
      throw new Error("api_key não encontrado");
    }

    if (!account) {
      throw new AppError({ message: "Conta não encontrada" });
    }

    try {
      const qrCodeDynamicResponse = await this.sendRequestToSettlement(input);

      const number_of_transaction =
        await getMaxNumberOfTransactionByAccountTransactions();

      const tx = await prisma.accountTransaction.create({
        data: {
          amount: input.amount || 0,
          data: qrCodeDynamicResponse.data,
          direction: "in",
          type: "PIX_DYNAMIC",
          account_id: account.id,
          status: "PENDING",
          description: !user ? "Wallet carregada" : "QR Code Pago",
          previousValue: account.balance!,
          newValue: !user
            ? account.balance! - input.amount
            : account.balance! + input.amount,
          number_of_transaction,
          idempotency_id: qrCodeDynamicResponse.data.data.external_id,
        },
      });

      if (graphAccount) {
        const number_of_transaction =
          await getMaxNumberOfTransactionByAccountTransactions();

        await prisma.graphicAccountTransaction.create({
          data: {
            graphic_account_id: graphAccount.id,
            transaction_id: tx.id,
            amount: input.amount || 0,
            data: qrCodeDynamicResponse.data,
            direction: "in",
            type: "PIX_DYNAMIC",
            status: "PENDING",
            previousValue: graphAccount.balance,
            newValue: graphAccount.balance + input.amount,
            number_of_transaction,
            idempotency_id: qrCodeDynamicResponse.data.data.external_id,
          },
        });
      }

      const qrCodeData = {
        userId: input.userId,
        payload: qrCodeDynamicResponse.data,
        status: "PENDING",
        virtual_account_id: input.virtual_account_id,
        idempotency_id: qrCodeDynamicResponse.data.data.external_id,
        type: "PIX_DYNAMIC",
      };

      await prisma.qrCode.create({
        data: qrCodeData,
      });

      return qrCodeDynamicResponse.data;
    } catch (err: any) {
      const error = requestError(err);

      if (error) {
        throw new AppError({
          status: error.status,
          code: error.code,
          message: error.message,
        });
      }
    }
  }

  private async sendRequestToSettlement(
    input: PixQrCodeDynamicCaseRequest,
  ): Promise<QrCodeDynamicGenerateResponse> {
    try {
      return await api.post(
        `/banking/cashin/pix/qrcodes`,
        {
          amount: input.amount,
          virtual_account_id: input.virtual_account_id,
          external_id: uuidv4(),
          options: {
            allow_change_the_amount_on_payment:
              input.options.allow_change_the_amount_on_payment,
            show_qrcode_image: input.options.show_qrcode_image,
          },
          description: input.description,
          counterparty: {
            name: input.counterparty.name,
            tax_number: input.counterparty.tax_number,
          },
        },
        {
          auth: {
            username: process.env.AUTH_USERNAME || "",
            password: process.env.AUTH_PASSWORD || "",
          },
        },
      );
    } catch (error: any) {
      throw new AppError({ message: "Falha ao gerar o qr code" });
    }
  }
}
