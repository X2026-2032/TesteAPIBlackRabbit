import { api } from "@/lib/axios";
import { IdezErrors } from "./idez-errors";

export class GetDelBankTransactions {
  public async getBalance(userId: string, api_key: string) {
    try {
      const response = await api.get(
        `/api/v1/charges/${userId}/payments?page=1&limit=10`,
        {
          headers: {
            "x-delbank-api-key": api_key,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new IdezErrors().message(error);
    }
  }
}
