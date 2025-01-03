import { AppError } from "../errors/app-error";
import { requestError } from "@/lib/axios";
import { BankTransfersRepository } from "@/repositories/bank-transfers-repository";

interface FindBankTransferByIdUseCaseRequest {
  id: string;
}

export class FindBankTransferByIdUseCase {
  constructor(private repository: BankTransfersRepository) {}

  async execute(params: FindBankTransferByIdUseCaseRequest) {
    try {
      const bankTransfer = await this.repository.findById(params.id);
      return { bankTransfer };
    } catch (err) {
      throw new AppError(requestError(err));
    }
  }
}
