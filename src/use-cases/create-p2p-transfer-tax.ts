import { UsersRepository } from "@/repositories/users-respository";
import { CreateTransactionUseCase } from "./transactions/create-transactions";
import { GetUsersAccountToken } from "./get-users-account-token";
import { IdezBankTransfersService } from "@/service/idez/bank-transfers";
import { UpdateTransactionsUseCase } from "./transactions/update-transactions";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

interface CreateP2pTransferUseCaseRequest {
  userId: string;
  pin: string;
  amount: number;
  payee_id: string;
  description?: string;
}

export class CreateP2pTaxTransferUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    amount,
    payee_id,
    description,
  }: CreateP2pTransferUseCaseRequest) {
    const data = {
      amount,
      payee_id,
      description,
    };

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
      }))) as (User & { status_pin_eletronic?: boolean }) | null;

    const status_pin_eletronic = userOrGraphic?.status_pin_eletronic || false;

    const statusP2pTransfer = status_pin_eletronic ? "done" : "waiting";
    console.log("Eu sou o statusP2pTransfer", statusP2pTransfer);

    const account = await prisma.account.findFirst({
      where: {
        refId: payee_id,
      },
      include: {
        user: true,
      },
    });

    if (!account) throw new Error("Conta não encontrada");

    const buildTransfer = {
      data: {
        ...data,
        payer: {
          name: account.user.name,
          document: account.user.document,
        },
        pin: undefined,
      },
      endToEndId: "",
      amount,
      direction: "out",
      status: "done",
      type: "p2p_transfer",
      description: `Taxa Check-out (Saída)`,
    };

    const p2p_transfer = await new CreateTransactionUseCase().execute(
      buildTransfer,
      userId,
    );

    if (p2p_transfer && !p2p_transfer.graphic) {
      try {
        const token = await GetUsersAccountToken.execute(userId);
        if (!token) throw new Error("Usuário inválido");

        const response = await new IdezBankTransfersService().p2pTransfer(
          data,
          token.access_token,
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
