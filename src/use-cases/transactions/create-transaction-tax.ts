import { IdezPixService } from "@/service/idez/pix";
import { AppError } from "../errors/app-error";

export class CreateTransactionTaxUseCase {
  public async execute(data: {
    amount: number;
    endToEndId: string;
    api_key: string;
  }) {
    try {
      const response = await new IdezPixService().transfers(
        {
          amount: data.amount,
          endToEndId: data.endToEndId,
          initiationType: "KEY",
        },
        data.api_key,
      );

      return response;
    } catch (error) {
      throw new AppError({ message: "Erro ao transferir P2P TAX" });
    }
  }
}
