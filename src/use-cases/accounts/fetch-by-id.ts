import { AccountsRepository } from "@/repositories/accounts-repository";
import { AppError } from "../errors/app-error";
import { requestError } from "@/lib/axios";

interface FetchByIdUseCaseRequest {
  id: string;
  role?: string;
}

export class FetchByIdUseCase {
  constructor(private repository: AccountsRepository) {}

  async execute(params: FetchByIdUseCaseRequest) {
    try {
      const account = await this.repository.findById(params.id, params.role);
      return { account };
    } catch (err) {
      throw new AppError(requestError(err));
    }
  }
}
