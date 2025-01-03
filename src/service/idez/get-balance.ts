import { api } from "@/lib/axios";
import { IdezErrors } from "./idez-errors";

export type IdezPixTransfersRequest = {
  amount: number;
  pin: string;
  key: string;
  id_tx?: string;
  description?: string;
};

export class getBalanceUser {
  public async getBalance(api_key: string) {
    try {
      const response = await api.get(`/baas/api/v1/pix/dict/entries`, {
        headers: {
          "x-delbank-api-key": api_key,
        },
      });
      return response.data;
    } catch (error) {
      throw new IdezErrors().message(error);
    }
  }
}
