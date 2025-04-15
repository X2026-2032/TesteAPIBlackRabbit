import { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UsersRepository } from "@/repositories/users-backoffice-respository";

interface GetUserProfileUseCaseRequest {
  userId: string;
}

interface GetUserProfileUseCaseResponse {
  user: User;
}

export class GetUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
  }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    const graphic = await prisma.graphicAccount.findUnique({
      where: {
        id: userId,
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

    if (!user && !graphic) throw new Error("Resource not found.");

    if (graphic) {
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
      } as any;
    }

    if (!user) throw new Error("Resouce not found.");

    return {
      user: {
        ...user,
        password: undefined,
      },
    } as any;
  }
}
