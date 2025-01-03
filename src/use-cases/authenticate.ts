// import { compare } from 'bcryptjs'
import { UsersRepository } from "@/repositories/users-respository";
import { AccountsRepository } from "@/repositories/accounts-repository";
import { AppError } from "./errors/app-error";
import { User } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { IdezAuthService } from "@/service/idez/auth";

interface AuthenticateUseCaseRequest {
  document: string;
  password: string;
}

interface AuthenticateUseCaseResponse {
  user: User;
  account: any;
}

export class AuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private accountsRepository: AccountsRepository,
  ) {}

  async execute({
    document,
    password,
  }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    try {
      const user = await this.usersRepository.findByDocument(document);

      const graphic = await prisma.graphicAccount.findFirst({
        where: {
          document,
        },
      });

      let userCompleted = false;

      if (graphic) {
        const _user = await prisma.user.findFirst({
          where: { id: graphic.id_master_user || "" },
        });
        userCompleted = _user?.status == "ACTIVE";
      }

      const errorMsg = new Error("Usuário ou senha incorretos");

      if (graphic && !userCompleted) {
        const userPassword = graphic?.password_hash;
        if (!userPassword) throw errorMsg;

        const isPassword = await compare(password, userPassword);
        if (!isPassword) {
          // Recupera o contador atual antes de incrementar
          const currentCounter = graphic.counter;

          // Incrementa o contador de erros apenas para contas gráficas
          await prisma.graphicAccount.update({
            where: {
              id: graphic.id,
            },
            data: {
              counter: graphic.counter + 1,
            },
          });

          if (currentCounter + 1 === 3) {
            await prisma.graphicAccount.update({
              where: {
                id: graphic.id,
              },
              data: {
                blocked: true,
              },
            });
          }

          throw errorMsg;
        }

        if (graphic.blocked) {
          throw new Error("Usuário impedido de fazer login. Conta bloqueada.");
        }

        await prisma.graphicAccount.update({
          where: {
            id: graphic.id,
          },
          data: {
            counter: 0,
          },
        });

        if (graphic.counter >= 3) {
          await prisma.graphicAccount.update({
            where: {
              id: graphic.id,
            },
            data: {
              blocked: false,
            },
          });
        }
      }

      if (!user && !graphic) throw errorMsg;

      const [graphicTransactions] =
        await prisma.graphicAccountTransaction.groupBy({
          by: ["graphic_account_id"],
          where: {
            status: "waiting",
            GraphicAccount: {
              user_id: user?.id ?? graphic?.user_id,
            },
          },
          _sum: {
            amount: true,
          },
        });

      if (graphic && !userCompleted) {
        const userPassword = graphic?.password_hash;

        if (!userPassword) throw errorMsg;

        const isPassword = await compare(password, userPassword);

        if (!isPassword) throw errorMsg;
        graphic.password_hash = undefined as any;
        const user_ =
          graphic.id_master_user &&
          (await prisma.user.findFirst({
            where: { id: graphic.id_master_user },
          }));

        return {
          account: {
            ...graphic,
            userMasterType: user_ ? user_.type : "",
            userStatus: user_ ? user_.status : "",
            graphic_balance: 0,
            graphic_transactions: graphicTransactions?._sum.amount,
          },
          user: {
            ...(graphic as any),
            type: graphic.role || "WALLET",
            role: graphic.role || "WALLET",
          },
        };
      }

      if (!user) throw errorMsg;

      const response = await new IdezAuthService().execute({
        password,
        document: user.document,
        account: user.refId,
        access_token: user.access_token,
      });

      const account = await this.accountsRepository.findByRefId(
        response.account,
      );
      if (!account) throw errorMsg;

      if (account.status == "under_review")
        throw new AppError({ message: "Conta em análise", status: 401 });

      await prisma.$transaction(async (tx) => {
        await tx.account.update({
          where: {
            id: account.id,
          },
          data: {
            status: response.account.status,
            balance: response.account.balance,
          },
        });

        await tx.accountToken.update({
          where: {
            account_id: account.id,
          },
          data: {
            //    access_token: response.access_token,
          },
        });
      });

      const [balanceGraphic] = await prisma.graphicAccount.groupBy({
        by: ["user_id"],
        where: {
          user_id: account.user_id,
        },
        _sum: {
          balance: true,
        },
      });
      return {
        user: {
          ...user,
          password: undefined as any,
        },
        account: {
          ...account,
          status: response.account.status,
          balance: response.account.balance,
          graphic_balance: balanceGraphic?._sum.balance,
          graphic_transactions: graphicTransactions?._sum.amount,
        },
      };
    } catch (error) {
      console.log(error);

      throw error;
    }
  }
}
