import { UsersRepository } from "@/repositories/users-messenger-respository";
import { GetUsersAccountToken } from "./get-users-account-token";
import { getBalanceUser } from "@/service/idez/get-balance";

interface GetBalanceUseCaseRequest {
  userId: string;
}

export class FetchBalanceUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId }: GetBalanceUseCaseRequest) {
    const user = await this.usersRepository.findById(userId);

    if (!user || !user.api_key) {
      throw new Error("Usuário ou api_key não encontrados");
    }

    const token = await GetUsersAccountToken.execute(userId);

    if (!token) throw new Error("Usuário inválido");

    const getBalance = new getBalanceUser();
    const balance = await getBalance.getBalance(user.api_key);
    //const keys = await idezPixService.listKeys(token.access_token, user.api_key);

    // Agora, inclua o atributo api_key nos resultados
    return { balance, api_key: user.api_key };
  }
}
