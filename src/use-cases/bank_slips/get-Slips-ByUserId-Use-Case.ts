import {
  BankSlipRepository,
  BankSlip,
} from "@/repositories/bank-slip-repository";

export interface GetSlipsByUserUseCaseResponse {
  bankSlips: BankSlip[];
}

export interface GetSlipsByUserUseCaseRequest {
  userId: string;
}

export class GetSlipsByUserUseCase {
  constructor(private repository: BankSlipRepository) {}

  async execute({
    userId,
  }: GetSlipsByUserUseCaseRequest): Promise<GetSlipsByUserUseCaseResponse> {
    try {
      const bankSlips = await this.repository.findByUserId(userId);

      return {
        bankSlips,
      };
    } catch (error) {
      console.log(error);
      throw new Error("Falha ao recuperar boletos do usuário!");
    }
  }
}
