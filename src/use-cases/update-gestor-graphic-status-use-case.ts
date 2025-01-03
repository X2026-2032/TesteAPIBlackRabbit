import { prisma } from "@/lib/prisma";

interface UpdateStatusParams {
  accountId: string;
  newStatus: boolean;
}

const updateAccountGestorStatusTransactionUseCase = async ({
  accountId,
  newStatus,
}: UpdateStatusParams) => {
  try {
    const existingAccount = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!existingAccount) {
      console.error(`Account with ID ${accountId} not found.`);
      throw new Error("Account not found"); // Pode personalizar a mensagem de erro conforme necessário
    }

    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { gestor_graphic: newStatus },
    });
  } catch (error) {
    console.error("Error updating account status in the database:", error);
    throw error;
  }
};

export { updateAccountGestorStatusTransactionUseCase };
