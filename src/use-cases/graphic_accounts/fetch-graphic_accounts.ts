import { AppError } from "../errors/app-error";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

interface FetchGrapicAccountUseCaseRequest {
  userId?: string; // Opcional para buscar por ID
  userName?: string; // Opcional para buscar por userName
}

export class FetchGrapicAccountUseCase {
  async execute({ userId, userName }: FetchGrapicAccountUseCaseRequest) {
    // Se userName for fornecido, busca pelo userName
    if (userName) {
      const user = await prisma.graphicAccount.findUnique({
        where: { userName },
      });

      if (!user) {
        throw new AppError({
          status: 400,
          code: "user.notfound",
          message: "Conta não encontrada pelo userName.",
        });
      }

      return { user };
    }

    // Se userId for fornecido, busca pelo ID do usuário
    if (userId) {
      const user = await prisma.graphicAccount.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError({
          status: 400,
          code: "user.notfound",
          message: "Conta não encontrada pelo ID.",
        });
      }

      return { user };
    }

    // Caso nenhum filtro seja fornecido, retorna todos os usuários
    const accounts = await prisma.graphicAccount.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    return { accounts };
  }
}

export async function changePassword(userId: string, newPassword: string) {
  try {
    const user = await prisma.graphicAccount.findUnique({
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
    const updatedUser = await prisma.graphicAccount.update({
      where: {
        id: userId,
      },
      data: {
        password_hash: {
          set: hashedPassword,
        },
      },
    });

    return { message: "Senha atualizada com sucesso" };
  } catch (error) {
    throw new Error(`Erro ao atualizar a senha: ${error}`);
  }
}
export async function changePasswordEletronic(
  userId: string,
  newPasswordEletronic: string,
) {
  try {
    const user = await prisma.graphicAccount.findUnique({
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

    const hashedPassword = await hash(newPasswordEletronic, 6);

    const updatedUser = await prisma.graphicAccount.update({
      where: {
        id: userId,
      },
      data: {
        userName: {
          set: hashedPassword,
          
        },
      },
    });

    return { message: "Senha Eletrônica atualizada com sucesso" };
  } catch (error) {
    throw new Error(`Erro ao atualizar a senha Eletrônica: ${error}`);
  }
}
