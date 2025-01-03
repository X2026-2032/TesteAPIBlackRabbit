import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function persistMyGraphicId(
  user_id: string,
  transactionId: string,
  id_user_graphic: string,
) {
  try {
    const result = await prisma.graphicTransactionByTxId.create({
      data: {
        transaction_idtx: transactionId,
        id_user_graphic: id_user_graphic,
        my_graphic_id: user_id,
      },
    });

    return result;
  } catch (error) {
    throw new Error("Error persisting my_graphic_id");
  }
}
