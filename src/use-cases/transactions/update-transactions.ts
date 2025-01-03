import { PixTransferDelBankResponse } from "@/@types/types";
import { prisma } from "@/lib/prisma";

export class UpdateTransactionsUseCase {
  public async execute(
    response: PixTransferDelBankResponse | undefined,
    id: string,
    graphic: boolean,
    status = "done",
  ) {
    await prisma.$transaction(async (tx) => {
      if (status === "error") {
        const query = {
          where: {
            id,
          },
        };
        return graphic
          ? await tx.graphicAccountTransaction.delete(query)
          : await tx.accountTransaction.delete(query);
      }
      const query = {
        where: {
          id,
        },
        data: {
          status,
          response,
        },
      };
      graphic
        ? await tx.graphicAccountTransaction.update(query)
        : await tx.accountTransaction.update(query);
    });
  }
}
