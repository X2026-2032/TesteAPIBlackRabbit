import { prisma } from "@/lib/prisma";

export class FetchBackofficeTransactionsByIdUseCase {
  async execute(id: string) {
    const graphic = await prisma.graphicAccountTransaction.findUnique({
      where: {
        id,
      },
      include: {
        GraphicAccount: true,
      },
    });
    const account = await prisma.accountTransaction.findUnique({
      where: {
        id,
      },
      include: {
        Account: true,
      },
    });
    const transaction = account ?? graphic;
    return {
      transaction,
      user: {},
    };
  }
}
