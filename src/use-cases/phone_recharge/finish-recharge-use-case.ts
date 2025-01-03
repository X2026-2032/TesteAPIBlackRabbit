import { PhoneRechargeRepository } from "@/repositories/phone-recharge-repository";
import { UsersRepository } from "@/repositories/users-respository";
import { CreateTransactionUseCase } from "../transactions/create-transactions";
import { GetUsersAccountToken } from "../get-users-account-token";
import { IdezPhoneRechargesService } from "@/service/idez/phone-recharges";
import { UpdateTransactionsUseCase } from "../transactions/update-transactions";
import { prisma } from "@/lib/prisma";

interface FinishRechargeUseCaseRequest {
  amount: number;
  pin: string;
}

export class FinishRechargeUseCase {
  constructor(
    private repository: PhoneRechargeRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute(
    userId: string,
    id: string,
    data: FinishRechargeUseCaseRequest,
  ) {
    const recharge = await this.repository.findById(id);
    if (!recharge) throw new Error("Recarga não encontrada");

    const buildRecharges = {
      data: {
        amount: data.amount,
        id: recharge.reference_id,
      },
      direction: "out",
      status: "waiting",
      amount: data.amount,
      type: "phone_recharges",
      description: `${recharge.area_code} - ${recharge.phone_number}`,
    };

    const phone_recharge = await new CreateTransactionUseCase().execute(
      buildRecharges,
      userId,
    );

    if (phone_recharge && !phone_recharge.graphic) {
      const token = await GetUsersAccountToken.execute(userId);
      if (!token) throw new Error("Usuário inválido");
      try {
        const response = await new IdezPhoneRechargesService().confirm(
          {
            pin: data.pin,
            amount: data.amount,
            id: recharge.reference_id!,
          },
          token.access_token,
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
          phone_recharge.transation.id,
          false,
        );
      } catch (error) {
        await new UpdateTransactionsUseCase().execute(
          undefined,
          phone_recharge.transation.id,
          false,
          "error",
        );
        throw error;
      }
    }

    return { phone_recharge };
  }
}
