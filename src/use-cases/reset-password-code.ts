// app/use-cases/reset-password-code-use-case.ts
import { requestError } from "@/lib/axios";
import { AppError } from "./errors/app-error";
import { prisma } from "@/lib/prisma";
import { PasswordResetRepository } from "@/repositories/password-reset-repository";
import { randomUUID } from "node:crypto";
import { Mail } from "@/utils/mail";
import btoa from "btoa";

interface ResetPasswordCodeUseCaseRequest {
  email: string;
}
interface IResponse {
  data: {
    message: string;
  };
}

interface ICustomError extends Error {
  response?: IResponse;
}

export class ResetPasswordCodeUseCase {
  constructor(private repository: PasswordResetRepository) {}

  async execute({ email }: ResetPasswordCodeUseCaseRequest) {
    try {
      return await this.sendResetCode(email);
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        const customError = error as ICustomError;
        if (customError.response?.data) {
          throw new AppError(requestError(customError.response.data));
        }
      }
      throw new Error(
        "Erro ao enviar código de recuperação de senha, o usuário não foi encontrado",
      );
    }
  }

  async sendResetCode(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      const graphic = await prisma.graphicAccount.findUnique({
        where: { email: email },
      });

      if (!user && !graphic) {
        throw new Error(
          "Usuário não encontrado com o e-mail fornecido." + email,
        );
      }

      const hashPassword = randomUUID();

      if (user) {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            hash_reset_password: hashPassword,
          },
        });
      }

      if (graphic) {
        await prisma.graphicAccount.update({
          where: {
            id: graphic.id,
          },
          data: {
            hash_reset_password: hashPassword,
          },
        });
      }

      const mail = new Mail();

      mail.send({
        sender: process.env.MAIL_SENDER as string,
        name: user?.name || graphic?.name || "err",
        email: user?.email || graphic?.email || "err",
        subject: "Código de confirmação",
        body: `
          <p>Olá ${
            user?.name || graphic?.name || ""
          }, click no link abaixo para recuperar o seu acesso.</p>

          <p>
            <a href="${process.env.BASE_URL}/recoveryPassword?email=${btoa(
          user?.email || graphic?.email || "err",
        )}&hash=${hashPassword}">Recuperar acesso</a>
          </p>
        `,
      });

      return { result: true };
    } catch (error: any) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}
