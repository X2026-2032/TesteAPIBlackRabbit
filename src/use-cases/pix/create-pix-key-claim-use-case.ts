import { UsersRepository } from "@/repositories/users-messenger-respository";
import { api, requestError } from "@/lib/axios";
import { AppError } from "../errors/app-error";

export interface CreatePixKeyClaimUseCaseRequest {
  userId: string;
  data: {
    key: string;
    keyType: any;
  };
}

export class CreatePixKeyClaimUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    data,
    userId,
  }: CreatePixKeyClaimUseCaseRequest): Promise<void> {
    try {
      const user = await this.usersRepository.findById(userId);
      const token = user?.access_token;
      const response = await api.post(`/pix/keys/claims`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error?.response.data) {
        throw new AppError(requestError(error?.response.data));
      }
      throw new Error("Falha ao realizar a recarga do telefone");
    }
  }
}
