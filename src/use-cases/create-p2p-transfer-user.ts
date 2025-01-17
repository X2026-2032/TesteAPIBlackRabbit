import { api, requestError } from "@/lib/axios";
import { UsersRepository } from "@/repositories/users-messenger-respository";
import { AppError } from "./errors/app-error";
import { CreateTransactionUseCase } from "./transactions/create-transactions";
import { GetUsersAccountToken } from "./get-users-account-token";
import { IdezBankTransfersService } from "@/service/idez/bank-transfers";
import { UpdateTransactionsUseCase } from "./transactions/update-transactions";
import { prisma } from "@/lib/prisma";
import generateIdempotencyKey from "@/utils/generateIdempotencyKey";
import { CreateTransactionUseCaseUser } from "./transactions/create-transction-user";

interface CreateP2pTransferUseCaseRequest {
  userId: string;
  amount: number;
  payee_id: string;
  description?: string;
  endToEndId?: string;
  // beneficiaryAccount: string;
  externalId?: string;
}

export class CreateP2pTransferUseCaseUser {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    // externalId,
    userId,
    amount,
    payee_id,
    description,
    endToEndId,
  }: CreateP2pTransferUseCaseRequest) {
    const data = {
      amount,
      payee_id,
      description,
      endToEndId,
      // externalId,
    };

    // conta do pagador
    const account_payer = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });

    //conta do beneficiario
    const account = await prisma.account.findFirst({
      where: {
        refId: payee_id,
      },
      include: {
        user: true,
      },
    });

    if (!account_payer) throw new Error("Conta do pagador não encontrada");
    if (!account) throw new Error("Conta não encontrada");

    const graphic = await prisma.graphicAccount.findFirst({
      where: { id: userId },
    });

    const buildTransfer = {
      data: {
        ...data,
        payer: {
          name: account_payer.name,
          document: account_payer.document,
        },
        pin: undefined,
      },
      amount,
      direction: "out",
      status: "done",
      type: "p2p_transfer",
      description: `P2P ${account.user.name}`,
    };

    const p2p_transfer = await new CreateTransactionUseCaseUser().execute(
      buildTransfer,
      userId,
    );

    if (p2p_transfer && !p2p_transfer.graphic) {
      try {
        const token = await GetUsersAccountToken.execute(userId);

        if (!token) throw new Error("Usuário inválido");

        let account5Digits;

        //valida a existencia de account_number e account_digit pra nao gerar erro
        if (account.account_number && account.account_digit) {
          account5Digits = `${account.account_number}${account.account_digit}`;
        }

        if (!account5Digits)
          throw new AppError({
            message: "5 digits account number is required for p2p transfer",
          });
        if (!account.api_key)
          throw new AppError({
            message: "account.api_key is required for this action",
          });

        const p2pData = { ...data, beneficiaryAccount: account5Digits };

        const response = await new IdezBankTransfersService().p2pTransfer(
          p2pData,
          account_payer.api_key!,
        );

        await prisma.$transaction(async (tx) => {
          const account = await tx.account.findUnique({
            where: {
              id: token.account_id,
            },
          });

          if (!account) throw new Error("Erro para atualizar saldo");

          const balance = account.balance! - amount;

          await tx.account.update({
            where: {
              id: account.id,
            },
            data: {
              balance,
            },
          });
        });

        await new UpdateTransactionsUseCase().execute(
          response,
          p2p_transfer.transation.id,
          false,
        );
      } catch (error) {
        console.log(error);

        await new UpdateTransactionsUseCase().execute(
          undefined,
          p2p_transfer.transation.id,
          false,
          "error",
        );
        throw error;
      }
    }
    return { p2p_transfer };
  }
}
