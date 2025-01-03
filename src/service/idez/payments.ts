import { api } from "@/lib/axios";
import { IdezErrors } from "./idez-errors";
import generateIdempotencyKey from "@/utils/generateIdempotencyKey";

export type IdezPaymentsRequest = {
  barcode: string;
  amount: number;
};
export class IdezPaymentsService {
  public async check(barcode: string, api_key: string) {
    try {
      const response = await api.get(`/baas/api/v1/bill-payments/${barcode}`, {
        headers: {
          "x-delbank-api-key": api_key,
        },
      });
      return response.data;
    } catch (error) {
      throw new IdezErrors().message(error);
    }
  }
  public async create(data: IdezPaymentsRequest, api_key: string) {
    try {
      const response = await api.post(
        `/baas/api/v1/bill-payments/`,
        {
          amount: data.amount,
          barCode: data.barcode,
        },
        {
          headers: {
            "x-delbank-api-key": api_key,
            IdempotencyKey: generateIdempotencyKey(),
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.log(error);
      console.log(error.response.data.errors);

      throw new IdezErrors().message(error);
    }
  }
  public async getSlipInfo(data: { digitableLine: string }, api_key: string) {
    try {
      const response = await api.get(
        `/baas/api/v1/bill-payments/${data.digitableLine}`,
        {
          headers: {
            "x-delbank-api-key": api_key,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.log(error);
      console.log(error.response.data.errors);
      throw new IdezErrors().message(error);
    }
  }
}
