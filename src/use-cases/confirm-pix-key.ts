import { UsersRepository } from "@/repositories/users-messenger-respository";
import { AppError } from "./errors/app-error";
import { prisma } from "@/lib/prisma";
import { GetUsersAccountToken } from "./get-users-account-token";
import { api } from "@/lib/axios";

interface ConfirmPixKeyUseCaseRequest {
  id: string;
  userId: string;
  token: string;
}

export class ConfirmPixKeyUseCase {
  private readonly usersRepository: UsersRepository;

  constructor(usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

  public async execute(input: ConfirmPixKeyUseCaseRequest) {
    const [token, user, graphic] = await Promise.all([
      GetUsersAccountToken.execute(input.userId),
      this.usersRepository.findById(input.userId),
      prisma.graphicAccount.findFirst({
        where: { id: input.userId },
      }),
    ]);

    if (!token) {
      throw new Error("Usuário inválido");
    }

    const api_key = user?.api_key || graphic?.virtual_account_id;

    if (!api_key) {
      throw new AppError({ message: "api_key not found" });
    }

    try {
      const response = await api.put(
        `/banking/cashin/pix/keys/${input.id}/confirm`,
        {
          token: input.token,
        },
        {
          auth: {
            username: process.env.AUTH_USERNAME || "",
            password: process.env.AUTH_PASSWORD || "",
          },
        },
      );

      return response.data;
    } catch (error: any) {
      return;
    }
  }
}
