import { PrismaClient } from "@prisma/client";
import { getMaxNumberOfTransactionByGraphicAccountTransactions } from "./generateNewNumberOfTransaction";

const prisma = new PrismaClient();

// Função para persistir dados no atributo transaction_id
export async function persistTransactionId(transactionId: string, graphicAccountId: string) {
  const number_of_transaction = await getMaxNumberOfTransactionByGraphicAccountTransactions()
  try {
    const result = await prisma.graphicAccountTransaction.create({
      data: {
        transaction_id: transactionId,
        GraphicAccount: {
          connect: {
            id: graphicAccountId,
          },
        },
        type: "example_type", // Preencha com o valor apropriado
        data: {}, // Preencha com o valor apropriado
        direction: "example_direction", // Preencha com o valor apropriado
        amount: 0,
        number_of_transaction, // Preencha com o valor apropriado
      },
    });

    console.log("Transaction ID persisted: ", result.transaction_id);
    return result;
  } catch (error) {
    console.error("Error persisting transaction ID: ", error);
    throw new Error("Error persisting transaction ID");
  }
}
