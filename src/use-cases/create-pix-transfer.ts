import { UsersRepository } from "@/repositories/users-messenger-respository";
import { CreateTransactionUseCase } from "./transactions/create-transactions";
import { GetUsersAccountToken } from "./get-users-account-token";
import { UpdateTransactionsUseCase } from "./transactions/update-transactions";
import { IdezPixService } from "@/service/idez/pix";
import { prisma } from "@/lib/prisma";
import { AppError } from "./errors/app-error";
import { PerformTaxUseCase, TaxNames } from "./tax/performTax";
import { sendExtractImageToEmail } from "@/utils/makeExtractPDF";

interface CreatePixTransferUseCaseRequest {
  userId: string;
  amount: number;
  pin: string;
  key: string;
  description?: string;
  id_tx?: string;
}

export class CreatePixTransferUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(data: any) {
    const userId = data.userId;

    // Busque o usuário ou a conta gráfica pelo ID
    const userOrGraphic = ((await prisma.user.findUnique({
      where: {
        id: userId,
      },
    })) ??
      (await prisma.graphicAccount.findUnique({
        where: {
          id: userId,
        },
      }))) as any;

    let someAccountApiKey =
      userOrGraphic.api_key || userOrGraphic.virtual_account_id;
    const isGraphic = !!userOrGraphic.virtual_account_id;

    if (userOrGraphic?.refId) {
      const account = await prisma.account.findFirst({
        where: {
          refId: userOrGraphic.refId,
        },
      });

      if (account?.api_key && !someAccountApiKey) {
        someAccountApiKey = account.api_key;
      }
    }
    if (!someAccountApiKey)
      throw new AppError({
        message: "api_key is required for this action",
        status: 400,
      });

    const buildPix = {
      ...data,
      data: {},
      type: "pix",
      direction: "out",
      status: userOrGraphic.role == "WALLET" ? "done" : "waiting",
      amount: data.amount,
      description: data.key,
      transactionId: undefined,
    };

    const pix = await new CreateTransactionUseCase().execute(buildPix, userId);
    if (pix && !pix.graphic) {
      const token = await GetUsersAccountToken.execute(userId);
      if (!token) {
        throw new Error("Usuário inválido");
      }

      try {
        data.id_tx = pix.transation.id;

        const response = await new IdezPixService().transfers(
          data,
          someAccountApiKey,
        );

        const account = await prisma.account.findUnique({
          where: {
            id: token.account_id,
          },
        });

        if (!account) {
          throw new Error("Nao existe conta");
        }

        await prisma.account.update({
          where: {
            id: account.id,
          },
          data: {
            balance: account.balance! - data.amount,
          },
        });

        await PerformTaxUseCase.execute({
          account_id: account.id,
          taxType: TaxNames.TRANSFERÊNCIA_PIX_CHECKOUT,
          transactionAmmount: data.amount,
          transactionId: pix.transation.id,
          createdAt: pix.transation.created_at,
          number_of_transactions: pix.transation.number_of_transaction!,
        });

        if (response) {
          const user = await prisma.user.findFirst({
            where: { id: userId },
          });
          await new UpdateTransactionsUseCase().execute(
            response,
            pix.transation.id,
            false,
          );
          if (user) {
            {
              sendExtractImageToEmail({
                name: user.name,
                to: user.email,
                transactionId: pix.transation.id,
              });
            }
          }
        }
      } catch (error: any) {
        await new UpdateTransactionsUseCase().execute(
          undefined as any,
          pix.transation.id,
          false,
          "error",
        );
      }
    }
    return pix?.transation;
  }
}
