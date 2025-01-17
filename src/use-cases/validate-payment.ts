import { UsersRepository } from "@/repositories/users-messenger-respository";
import { GetUsersAccountToken } from "./get-users-account-token";
import { IdezPaymentsService } from "@/service/idez/payments";
import { prisma } from "@/lib/prisma";
import { AppError } from "./errors/app-error";

interface CreateBankTransferUseCaseRequest {
  userId: string;
  barCode: string;
}

export class ValidatePaymentUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId, barCode }: CreateBankTransferUseCaseRequest) {
    const token = await GetUsersAccountToken.execute(userId);
    if (!token) throw new Error("Usuário inválido");

    const user = await prisma.user.findFirst({ where: { id: userId } });
    const graphic = await prisma.graphicAccount.findFirst({
      where: { id: userId },
    });

    const someApiKey = user?.api_key || graphic?.virtual_account_id;

    if (!someApiKey)
      throw new AppError({ message: "ApiKey is required for this action." });

    const payment = await new IdezPaymentsService().check(barCode, someApiKey);
    return { payment };
  }
}
