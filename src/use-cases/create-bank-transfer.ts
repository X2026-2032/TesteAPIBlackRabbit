import { api, requestError } from "@/lib/axios";
import { UsersRepository } from "@/repositories/users-messenger-respository";
import { AppError } from "./errors/app-error";
import { prisma } from "@/lib/prisma";
import { AccountsRepository } from "@/repositories/accounts-repository";
import { BankTransfer } from "@prisma/client";
import { BankTransfersRepository } from "@/repositories/bank-transfers-repository";
import { CreateTransactionUseCase } from "./transactions/create-transactions";
import { GetUsersAccountToken } from "./get-users-account-token";
import { UpdateTransactionsUseCase } from "./transactions/update-transactions";
import { IdezBankTransfersService } from "@/service/idez/bank-transfers";

interface CreateBankTransferUseCaseRequest {
  userId: string;
  data: {
    pin: string;
    amount: number;
    bank_account: {
      name: string;
      document: string;
      bank: string;
      branch: string;
      account_number: string;
      account_digit: string;
    };
  };
}

export class CreateBankTransferUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private accountsRepository: AccountsRepository,
    private bankTransferRepository: BankTransfersRepository,
  ) {}

  async execute({ userId, data }: CreateBankTransferUseCaseRequest) {
    const buildTransfer = {
      type: "ted",
      direction: "out",
      status: "waiting",
      amount: data.amount,
      data: this.makeBankTransferToPersist(data),
      description: data?.bank_account?.name,
    };
    const bank_transfer = await new CreateTransactionUseCase().execute(
      buildTransfer,
      userId,
    );
    if (bank_transfer && !bank_transfer.graphic) {
      const token = await GetUsersAccountToken.execute(userId);
      if (!token) throw new Error("Usuário inválido");
      try {
        const response = await new IdezBankTransfersService().transfers(
          data,
          token.access_token,
          "\n\n ola meu amigo",
        );
        await prisma.$transaction(async (tx) => {
          const account = await tx.account.findUnique({
            where: {
              id: token.account_id,
            },
          });
          if (!account) throw new Error("Erro para atualizar saldo");

          const balance = account.balance! - data.amount;
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
          bank_transfer.transation.id,
          false,
        );
      } catch (error) {
        await new UpdateTransactionsUseCase().execute(
          undefined,
          bank_transfer.transation.id,
          false,
          "error",
        );
        throw error;
      }
    }
    return { bank_transfer };
  }

  private makeBankTransferToPersist(data: any) {
    return {
      meta: data.meta,
      status: data.status,
      amount: +data.amount,
      direction: data.direction,
      account_id: data.account_id,
      description: data.description,
      beneficiary_name: data.beneficiary_name,
      bank_account_bank: data.bank_account.bank,
      cr_transaction_id: data.cr_transaction_id,
      bank_account_name: data.bank_account.name,
      bank_account_branch: data.bank_account.branch,
      bank_account_document: data.bank_account.document,
      bank_account_digit: data.bank_account.account_digit,
      bank_account_number: data.bank_account.account_number,
      payer: {
        name: data.bank_account.name,
        document: data.bank_account.document,
      },
    };
  }
}
