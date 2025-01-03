// app/use-cases/reset-password-code-use-case.ts

import { requestError } from "@/lib/axios";
import { AppError } from "./errors/app-error";
import { prisma } from "@/lib/prisma";
import atob from "atob";

import axios from "axios";
import { hashSync } from "bcryptjs";

interface UpdatePasswordUseCaseRequest {
  reset_code: string;
  password: string;
  email: string;
  pin: string;
}

export class UpdatePasswordUseCase {
  async execute({
    email,
    reset_code,
    password,
    pin,
  }: UpdatePasswordUseCaseRequest) {
    try {
      const emailDecoded = atob(email);

      const user = await prisma.user.findUnique({
        where: { email: emailDecoded },
      });

      const graphic = await prisma.graphicAccount.findUnique({
        where: { email: emailDecoded },
      });

      if (!user && !graphic) {
        throw new Error("Usuário não encontrado com o e-mail fornecido.");
      }

      if (user) {
        const account = await prisma.account.findFirst({
          where: {
            user: { email: emailDecoded },
          },
        });

        if (!account) {
          throw new Error("Conta não encontrada.");
        }

        if (account.pin !== pin) {
          throw new Error("PIN inválido.");
        }

        const hashVerify = await prisma.user.findMany({
          where: {
            email: emailDecoded,
            hash_reset_password: reset_code,
          },
        });

        if (!hashVerify) {
          throw new Error("Código de verificação inválido.");
        }

        const passwordHash = hashSync(password, 6);

        await prisma.user.update({
          where: { email: emailDecoded },
          data: { password: passwordHash },
        });

        return { result: true };
      }

      if (graphic) {
        if (graphic.pin !== pin) {
          throw new Error("PIN inválido.");
        }

        const hashVerify = await prisma.graphicAccount.findMany({
          where: {
            email: emailDecoded,
            hash_reset_password: reset_code,
          },
        });

        if (!hashVerify) {
          throw new Error("Código de verificação inválido.");
        }

        const passwordHash = hashSync(password, 6);

        await prisma.graphicAccount.update({
          where: { email: emailDecoded },
          data: { password_hash: passwordHash },
        });

        return { result: true };
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as any;
        console.error("Erro na requisição à API:", axiosError.response.data);
      } else {
        console.error(error);
      }

      if (error instanceof Error && "response" in error) {
        const customError = error as any;
        if (customError.response?.data) {
          throw new AppError(requestError(customError.response.data));
        }
      }

      if (error instanceof Error) {
        throw new AppError(error);
      } else {
        throw new Error(
          "Erro ao atualizar senha, o usuário não foi encontrado",
        );
      }
    }
  }
}
