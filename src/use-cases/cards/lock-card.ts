import { UsersRepository } from "@/repositories/users-respository";
import { AppError } from "../errors/app-error";
import { api, requestError } from "@/lib/axios";
import { CardsRepository } from "@/repositories/cards-repository";

interface LockCardUseCaseRequest {
  userId: string;
  cardId: string;
}

export class LockCardUseCase {
  constructor(
    private repository: CardsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ userId, cardId }: LockCardUseCaseRequest) {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw new AppError({
          status: 400,
          code: "account.notfound",
          message: "Conta não encontrada.",
        });
      }

      const card = await this.repository.findById(cardId);
      const token = user?.access_token;
      const { data: lockCardIdez } = await api.patch(
        `/cards/${card?.reference_id}/lock`,
        {
          description: "other",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(lockCardIdez);
      return this.repository.updateStatus({
        id: cardId,
        status: lockCardIdez.status,
      });
    } catch (error: any) {
      if (error?.response?.data) {
        throw new AppError(requestError(error?.response.data));
      }
      throw new Error("Falha ao tentar bloquear o cartão.");
    }
  }
}
