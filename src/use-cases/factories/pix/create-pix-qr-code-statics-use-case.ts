import { api, requestError } from "@/lib/axios";
import { UsersRepository } from "@/repositories/users-messenger-respository";
import { AppError } from "@/use-cases/errors/app-error";
import { GetUsersAccountToken } from "@/use-cases/get-users-account-token";

interface PixQrCodeStaticCaseRequest {
  userId: string;
  amount: number;
  key: string;
  description?: string;
  id_tx?: string;
}

export class PixQrCodeStaticUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    amount,
    key,
    description,
    id_tx,
  }: PixQrCodeStaticCaseRequest) {
    const token = await GetUsersAccountToken.execute(userId);
    if (!token) throw new Error("Usuário inválido");

    try {
      const response = await api.post(
        `/pix/qr-codes/static`,
        {
          amount,
          key,
          description,
          id_tx,
        },
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        },
      );

      return response.data; // Retornar a resposta da requisição
    } catch (err) {
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
}
