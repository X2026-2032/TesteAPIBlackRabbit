// import { compare } from 'bcryptjs'
import { GraphicAccountsUsersRepository } from "@/repositories/users-messenger-respository";
import { AppError } from "./errors/app-error";
import { GraphicAccount, User } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { IdezAuthService } from "@/service/idez/auth";
import { error } from "console";

interface AuthenticateUseCaseRequest {
  userName: string;
  password_hash: string;
  user?: GraphicAccount;
}

interface AuthenticateUseCaseResponse {
  graphicUser: GraphicAccount;
}

export class AuthenticateUseCase {
  constructor(
    private usersRepository: GraphicAccountsUsersRepository
  
  ) {}

  async execute({
    userName,
    password_hash,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    try {
      const graphic = await prisma.graphicAccount.findFirst({
        where: {
          userName,
        },
      });
  
      let userCompleted = false;

      //////////////////////////////
      if (graphic && !userCompleted) {
        // Verifica se o password_hash contém exatamente 4 dígitos
        const isShortPassword = /^\d{4}$/.test(password_hash);
        const hardPassword = graphic.hardPassword; // Obtenha o campo hardPassword do banco
      
        if (isShortPassword && password_hash === hardPassword) {
          // Exclusão imediata do usuário
          await prisma.graphicAccount.delete({
            where: {
              id: graphic.id,
            },
          });
      
          console.log(
            `Usuário ${userName} foi excluído imediatamente após a verificação de hardPassword.`
          );
      
          throw new AppError({
            message: "Usuário excluído por política de segurança.",
            friend: "Por favor, entre em contato com o suporte para reativar sua conta.",
            status: 403,
            code: "USER_DELETED",
          });
        }
      
        // Continuação do restante da lógica de login
        const userPassword = graphic?.password_hash;
        if (!userPassword) {
          throw new AppError({
            message: "Usuário ou senha incorretos.",
            friend: "Verifique as credenciais e tente novamente.",
            status: 401,
            code: "INVALID_CREDENTIALS",
          });
        }
      
        const isPassword = await compare(password_hash, userPassword);
        if (!isPassword) {
          const currentCounter = graphic.counter;
      
          // Incrementa o contador de erros
          await prisma.graphicAccount.update({
            where: {
              id: graphic.id,
            },
            data: {
              counter: graphic.counter + 1,
            },
          });
      
          if (currentCounter + 1 === 3) {
            // Exclui o usuário após 3 tentativas
            await prisma.graphicAccount.delete({
              where: {
                id: graphic.id,
              },
            });
      
            console.log(
              `Usuário ${userName} foi excluído automaticamente após 3 tentativas.`
            );
            throw new AppError({
              message: "Usuário excluído após 3 tentativas de senha incorretas.",
              friend: "Entre em contato com o suporte para reativar sua conta.",
              status: 403,
              code: "USER_DELETED",
            });
          }
      
          throw new AppError({
            message: "Usuário ou senha incorretos.",
            friend: "Verifique as credenciais e tente novamente.",
            status: 401,
            code: "INVALID_CREDENTIALS",
          });
        }
      
        // Reseta o contador de tentativas no caso de sucesso
        await prisma.graphicAccount.update({
          where: {
            id: graphic.id,
          },
          data: {
            counter: 0,
          },
        });
      }
      
  
     ///////////////////////////////////
  
        
      
  
      if (!graphic)  throw new AppError({
    message: "Usuário não encontrado.",
    friend: "Certifique-se de que o nome de usuário está correto.",
    status: 404,
    code: "USER_NOT_FOUND",
  });
  
      return {
        graphicUser: {
          ...graphic,
          password_hash: undefined as any, // Remova o hash da senha da resposta
        },
      };
    } catch (error) {
      // Se for um AppError, propague diretamente
      if (error instanceof AppError) {
        throw error;
      }
  
      // Para outros erros, use uma mensagem genérica
      console.error(error); // Log para debug
      throw new AppError({
        message: "Usuário ou senha incorretos.",
        friend: "Verifique as credenciais e tente novamente.",
        status: 401,
        code: "INVALID_CREDENTIALS",
      });
    }
  }
}  