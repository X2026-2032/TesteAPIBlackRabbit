import { AccountsRepository } from "@/repositories/accounts-repository";
import { AppError } from "../errors/app-error";
import { requestError } from "@/lib/axios";
import { IParams } from "@/repositories/dtos/params-dto";
import { makeFetchReturn } from "@/utils/make-fetch-return";
import { BankTransfersRepository } from "@/repositories/bank-transfers-repository";

export class FindAllBankTransfersUseCase {
  constructor(private repository: BankTransfersRepository) {}

  async execute(params: IParams) {
    try {
      const [count, bankTransfers] = await this.repository.findAll(params);
      return makeFetchReturn({ params, count, data: { bankTransfers } });
    } catch (err) {
      throw new AppError(requestError(err));
    }
  }
}
