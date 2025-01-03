import { prisma } from "@/lib/prisma";
import { AppError } from "../errors/app-error";
import { hash } from "bcryptjs";

export async function changeUserPassword(userId: string, newPassword: string) {
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

    const hashedPassword = await hash(newPassword, 6);

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: {
          set: hashedPassword,
        },
      },
    });

    return { message: "Senha atualizada com sucesso" };
  } catch (error) {
    throw new Error(`Erro ao atualizar a senha: ${error}`);
  }
}
