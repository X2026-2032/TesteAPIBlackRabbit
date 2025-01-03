import { api } from "@/lib/axios";
import { IdezErrors } from "./idez-errors";

export class IdezBankSlipsService {
  public async execute(data: any, api_key: string): Promise<any> {
    try {
      //colocar nova implementacao da delbank
      console.log(data);
      const { data: bankSlip } = await api.post(`/v1/charges`, data, {
        headers: {
          "x-delbank-api-key": api_key,
        },
      });

      // const response = {
      //   correlationId: bankSlips.correlationId,
      //   barcode: bankSlips.barCode,
      //   digitable_line: bankSlips.digitableLine,
      // };

      console.log(bankSlip);
      return bankSlip;
    } catch (error: any) {
      console.log(error);
      console.log(error.response.data.errors);

      throw new IdezErrors().message(error);
    }
  }
  // public async getPdf(id: string, token: string) {
  //   try {
  //     const response = await api.get(`/bank-slips/${id}/pdf`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //       responseType: "arraybuffer",
  //     });
  //     return response.data;
  //   } catch (error) {
  //     throw new IdezErrors().message(error);
  //   }
  // }
}
