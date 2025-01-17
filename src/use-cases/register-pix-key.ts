import { api, requestError } from "@/lib/axios";
import { UsersRepository } from "@/repositories/users-messenger-respository";
import { AppError } from "./errors/app-error";
import { GetUsersAccountToken } from "./get-users-account-token";

type RegisterPixKeyUseCaseResponse = {
  data: {
    bank_account_id: string;
    entity_id: string;
    id: string;
    inserted_at: string;
    key: string;
    stages: [
      {
        id: string;
        inserted_at: string;
        type: string;
        updated_at: string;
      },
      {
        id: string;
        inserted_at: string;
        type: string;
        updated_at: string;
      },
    ];
    type: string;
    updated_at: string;
  };
};

interface RegisterPixKeyCaseRequest {
  userId: string;
  bank_account_id: string;
  key: string;
  key_type: string;
}

export class RegisterPixKeyUseCase {
  private readonly usersRepository: UsersRepository;

  constructor(usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

  public async execute(input: RegisterPixKeyCaseRequest) {
    try {
      const [token, user] = await Promise.all([
        GetUsersAccountToken.execute(input.userId),
        this.usersRepository.findById(input.userId),
      ]);

      if (!token) {
        throw new Error("Usuário inválido");
      }

      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      const response = await this.requestToRegisterKeys(input);

      return response.data;
    } catch (err: any) {
      console.error(err);
      const error = requestError(err);

      if (error) {
        throw new AppError({
          status: error.status,
          code: error.code,
          message: error.message,
        });
      }
    }
  }
  private async requestToRegisterKeys(
    input: RegisterPixKeyCaseRequest,
  ): Promise<RegisterPixKeyUseCaseResponse> {
    return await api.post(
      `/banking/cashin/pix/keys`,
      {
        bank_account_id: input.bank_account_id,
        key: input.key,
        type: input.key_type,
      },
      {
        auth: {
          username: process.env.AUTH_USERNAME || "",
          password: process.env.AUTH_PASSWORD || "",
        },
      },
    );
  }
}
