import { AppError } from "./errors/app-error";
import { prisma } from "@/lib/prisma";

interface GetGraphicAccountByNumberIdentifierUseCaseRequest {
  number_identifier: string;
}

export class GetGraphicAccountByNumberIdentifierUseCase {
  async execute({
    number_identifier,
  }: GetGraphicAccountByNumberIdentifierUseCaseRequest) {
    const user = await prisma.graphicAccount.findFirst({
      where: {
        number_identifier,
      },
    });

    if (!user) {
      throw new AppError({
        status: 400,
        code: "account.notfound",
        message: "Conta não encontrada.",
      });
    }

    const raw = {
      id: user.id,
      name: user.name,
      document: user.document,
      balance: user.balance,
      role: user.role,
      number_identifier: user.number_identifier,
    };

    return { user: raw };
  }
}
