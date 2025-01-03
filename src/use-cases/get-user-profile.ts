import { UsersRepository } from "@/repositories/users-respository";
import { Account, User } from "@prisma/client";
import { AccountsRepository } from "@/repositories/accounts-repository";
import { prisma } from "@/lib/prisma";

interface GetUserProfileUseCaseRequest {
  userId: string;
}

interface GetUserProfileUseCaseResponse {
  user: User;
  account: Account | null;
}

export class GetUserProfileUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private accountsRepository: AccountsRepository,
  ) {}

  async execute({
    userId,
  }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    const graphic = await prisma.graphicAccount.findUnique({
      where: {
        id: userId,
      },
      include: {
        user: true,
      },
    });

    const whereTransactions = graphic?.id
      ? {
          graphic_account_id: graphic?.id,
        }
      : {
          GraphicAccount: {
            user_id: userId,
          },
        };
    const [graphicTransactions] =
      await prisma.graphicAccountTransaction.groupBy({
        by: ["graphic_account_id"],
        where: {
          status: "waiting",
          ...whereTransactions,
        },
        _sum: {
          amount: true,
        },
      });

    if (!user && !graphic) throw new Error("Resource not found.");

    if (graphic) {
      const user =
        graphic.id_master_user &&
        (await prisma.user.findFirst({
          where: { id: graphic.id_master_user },
        }));
      const account = {
        ...graphic,
        userMasterType: user ? user.type : "",
        userStatus: user ? user.status : "",
        user: undefined,
        password_hash: undefined,
      };
      return {
        user: {
          ...account,
        },
        account: {
          ...account,
          graphic_balance: 0,
          graphic_transactions: graphicTransactions?._sum.amount ?? 0,
        },
      } as any;
    }

    if (!user) throw new Error("Resouce not found.");

    const account = await this.accountsRepository.findByUserId(user.id);
    if (!account) throw new Error("Conta não encontrada get-user-profile");

    const userMasterRequireDocuments = false;

    const [balanceGraphic] = await prisma.graphicAccount.groupBy({
      by: ["user_id"],
      where: {
        user_id: userId,
      },
      _sum: {
        balance: true,
      },
    });
    return {
      account: {
        ...account,
        graphic_balance: balanceGraphic?._sum.balance,
        graphic_transactions: graphicTransactions?._sum.amount ?? 0,
      },
      user: {
        ...user,
        userMasterRequireDocuments: false,
        Account: undefined,
        password: undefined,
      },
    } as any;
  }
}
