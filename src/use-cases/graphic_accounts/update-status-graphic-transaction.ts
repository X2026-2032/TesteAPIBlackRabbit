// use-cases/graphic_accounts/update-status-graphic-transaction.ts

import { prisma } from "@/lib/prisma";

interface UpdateStatusParams {
  accountId: string;
  newStatus: boolean; // Ou o tipo correto para status_pin_eletronic
}

const updateAccountGraphicStatusTransactionUseCase = async ({
  accountId,
  newStatus,
}: UpdateStatusParams) => {
  try {
    await prisma.graphicAccount.update({
      where: { id: accountId },
      data: { status_pin_eletronic: newStatus },
    });
  } catch (error) {
    console.error("Error updating account status in the database:", error);
    throw error;
  }
};

export { updateAccountGraphicStatusTransactionUseCase };
