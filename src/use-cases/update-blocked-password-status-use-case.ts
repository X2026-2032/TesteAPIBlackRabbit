import { prisma } from "@/lib/prisma";

interface UpdateStatusParams {
  accountId: string;
  newStatusBlocked: boolean;
}

const updateAccountBlockedPasswordStatusTransactionUseCase = async ({
  accountId,
  newStatusBlocked,
}: UpdateStatusParams) => {
  try {
    let updatedAccount;
    let updatedAccountGraphic;

    const existingAccount = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (existingAccount) {
      const counter = existingAccount.blocked !== true ? 3 : 0;
      updatedAccount = await prisma.account.update({
        where: { id: accountId },
        data: { blocked: newStatusBlocked, counter: counter },
      });
    } else {
      const existingAccountGraphic = await prisma.graphicAccount.findUnique({
        where: { id: accountId },
      });

      if (existingAccountGraphic) {
        const counter = existingAccountGraphic.blocked !== true ? 3 : 0;
        updatedAccountGraphic = await prisma.graphicAccount.update({
          where: { id: accountId },
          data: { blocked: newStatusBlocked, counter: counter },
        });
      } else {
        console.error(`Account with ID ${accountId} not found.`);
        throw new Error("Account not found");
      }
    }
  } catch (error) {
    console.error("Error updating account status in the database:", error);
    throw error;
  }
};

export { updateAccountBlockedPasswordStatusTransactionUseCase };
