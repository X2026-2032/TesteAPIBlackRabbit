import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateAccount(userId: string, accountData: any): Promise<any> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verifique se o refId é nulo e lance um erro se for o caso
    if (user.refId === null) {
      throw new Error("User refId is null");
    }

    // Encontre a conta associada ao usuário usando refId
    const account = await prisma.account.findFirst({
      where: { refId: user.refId },
    });

    if (!account) {
      throw new Error("User does not have an account");
    }

    // Atualize os campos necessários da conta do usuário
    const updatedAccount = await prisma.account.update({
      where: { id: account.id },
      data: {
        branch_number: accountData.branch_number,
        account_number: accountData.account_number,
        account_digit: accountData.account_digit,
        alias_status: accountData.alias_status,
        api_key: accountData.api_key,
        code_bank: accountData.code_bank,
        status: accountData.status,
        // Adicione outros campos conforme necessário
      },
    });

    return updatedAccount;
  } catch (error) {
    throw new Error("Error updating account: " + error.message);
  } finally {
    await prisma.$disconnect();
  }
}

export { updateAccount };
