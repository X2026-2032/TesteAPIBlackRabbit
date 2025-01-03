import { BankSlipRepository } from "@/repositories/bank-slip-repository";
import { BankSlip } from "@prisma/client";

interface GetSlipUseCaseRequest {
  id: string;
}

interface GetSlipUseCaseResponse {
  bankSlip: BankSlip;
}

export class GetSlipUseCase {
  constructor(private repository: BankSlipRepository) {}

  async execute({
    id,
  }: GetSlipUseCaseRequest): Promise<GetSlipUseCaseResponse> {
    try {
      const bankSlip = await this.repository.findById(id);

      if (!bankSlip) {
        throw new Error("Boleto não encontrado");
      }

      return {
        bankSlip,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Falha ao buscar o boleto");
    }
  }
}
