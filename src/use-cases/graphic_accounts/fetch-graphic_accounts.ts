import { UsersRepository } from "@/repositories/users-respository";
import { AppError } from "../errors/app-error";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

interface FetchGrapicAccountUseCaseRequest {
  userId: string;
}

export class FetchGrapicAccountUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId }: FetchGrapicAccountUseCaseRequest) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppError({
        status: 400,
        code: "user.notfound",
        message: "Conta não encontrada. fetch graphic",
      });
    }

    const accounts = await prisma.graphicAccount.findMany({
      where: {
        user_id: user.id,
      },
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
        security_eletronic: {
          set: hashedPassword,
        },
      },
    });

    return { message: "Senha Eletrônica atualizada com sucesso" };
  } catch (error) {
    throw new Error(`Erro ao atualizar a senha Eletrônica: ${error}`);
  }
}
