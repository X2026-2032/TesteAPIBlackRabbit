import { api, requestError } from "@/lib/axios";
import { UsersRepository } from "@/repositories/users-messenger-respository";
import { GetUsersAccountToken } from "../get-users-account-token";
import { AppError } from "../errors/app-error";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";
import { Account, GraphicAccount } from "@prisma/client";
import { getMaxNumberOfTransactionByAccountTransactions } from "@/utils";

type QrCodeStaticGenerateResponse = {
  data: {
    data: {
      amount: {
        amount: number;
        currency: string;
      };
      bank_account_id: string;
      description: string;
      entity_id: string;
      external_id: string;
      hash: string;
      id: string;
      pix_key_id: string;
      timestamp: string;
      virtual_account_id: string;
    };
  };
};

type QrCodeStaticOptions = {
  show_qrcode_image: boolean;
};

interface PixQrCodeStaticCaseRequest {
  userId: string;
  amount: number;
  description: string;
  options: QrCodeStaticOptions;
  virtual_account_id: string;
}

export class PixQrCodeStaticUseCase {
  private readonly usersRepository: UsersRepository;

  constructor(usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

  public async execute(input: PixQrCodeStaticCaseRequest) {
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
      const response = await this.sendRequestToSettlement(input);

      const latestTransaction =
        await prisma.graphicAccountTransaction.findFirst({
          orderBy: {
            created_at: "desc",
          },
          select: {
            number_of_transaction: true,
          },
        });

      const tx = await prisma.accountTransaction.create({
        data: {
          amount: input.amount || 0,
          data: response.data,
          direction: "in",
          type: "PIX_STATIC",
          status: "PENDING",
          description: !user ? "Wallet carregada" : "QR Code Pago",
          previousValue: account.balance!,
          newValue: !user
            ? account.balance! - (input.amount || 0)
            : account.balance! + (input.amount || 0),
          number_of_transaction: latestTransaction?.number_of_transaction
            ? latestTransaction.number_of_transaction + 1
            : 1,
          idempotency_id: response.data.data.external_id,
          Account: {
            connect: {
              id: account.id,
            },
          },
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
            data: response.data,
            direction: "in",
            type: "PIX_STATIC",
            status: "PENDING",
            previousValue: graphAccount.balance!,
            newValue: graphAccount.balance! + response.data.data.amount.amount,
            idempotency_id: response.data.data.external_id,
            number_of_transaction,
          },
        });
      }

      await prisma.qrCode.create({
        data: {
          userId: input.userId,
          payload: response.data.data,
          status: "PENDING",
          virtual_account_id: input.virtual_account_id,
          idempotency_id: response.data.data.external_id,
          type: "PIX_STATIC",
        },
      });

      return response.data;
    } catch (err) {
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
    input: PixQrCodeStaticCaseRequest,
  ): Promise<QrCodeStaticGenerateResponse> {
    try {
      return await api.post(
        `/banking/cashin/pix/qrcodes/static`,
        {
          amount: input.amount,
          description: input.description,
          external_id: uuidv4(),
          options: input.options,
          virtual_account_id: input.virtual_account_id,
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
