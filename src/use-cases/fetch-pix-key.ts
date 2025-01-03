import { UsersRepository } from "@/repositories/users-respository";
import { GetUsersAccountToken } from "./get-users-account-token";
import { IdezPixService } from "@/service/idez/pix";

type GetTransactionsUseCaseRequest = {
  userId: string;
};

export class FetchPixKeysUseCase {
  private readonly usersRepository: UsersRepository;

  constructor(usersRepository: UsersRepository) {
    this.usersRepository = usersRepository;
  }

  public async execute(input: GetTransactionsUseCaseRequest) {
    try {
      const [user, token] = await Promise.all([
        this.usersRepository.findById(input.userId),
        GetUsersAccountToken.execute(input.userId),
      ]);

      if (!user || !user.bank_account_id) {
        throw new Error("Usuário ou api_key não encontrados");
      }

      if (!token) {
        throw new Error("Usuário inválido");
      }

      const idezPixService = new IdezPixService();
      return await idezPixService.listKeys(user.bank_account_id);
    } catch (error) {
      console.error(error);
    }
  }
}
