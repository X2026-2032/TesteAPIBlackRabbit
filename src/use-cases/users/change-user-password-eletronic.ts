import { prisma } from "@/lib/prisma";
import { AppError } from "../errors/app-error";

export async function changeUserPasswordEletronic(
  userId: string,
  newPasswordEletronic: string,
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new AppError({
        status: 400,
        code: "user.notfound",
        message: "Conta não encontrada. facth graphic dois",
      });
    }

    await prisma.account.updateMany({
      where: {
        user_id: userId,
      },
      data: {
        security_eletronic: newPasswordEletronic,
      },
    });

    return { message: "Senha atualizada com sucesso" };
  } catch (error) {
    throw new Error(`Erro ao atualizar a senha: ${error}`);
  }
}
