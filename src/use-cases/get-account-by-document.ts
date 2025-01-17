import { UsersRepository } from "@/repositories/users-messenger-respository";
import { AppError } from "./errors/app-error";
import { prisma } from "@/lib/prisma";

interface GetAccountByDocumentUseCaseRequest {
  document: string;
}

export class GetAccountByDocumentUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ document }: GetAccountByDocumentUseCaseRequest) {
    const graphic = await prisma.graphicAccount.findFirst({
      where: {
        document,
      },
      include: {
        account: true,
      },
    });

    if (!graphic) {
      throw new AppError({
        status: 400,
        code: "account.notfound",
        message: "Conta não encontrada.",
      });
    }

    const raw = {
      id: graphic.id,
      name: graphic.name,
      document: graphic.document,
      account: graphic?.account || null,
      number_identifier: graphic.number_identifier,
      virtual_account_id: graphic.virtual_account_id,
      role: graphic.role,
    };

    return { user: raw };
  }
}
