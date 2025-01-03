import generateIdempotencyKey from "@/utils/generateIdempotencyKey";
import { IdezErrors } from "./idez-errors";
import { api } from "@/lib/axios";

export type P2pTransferRequest = {
  amount: number;
  beneficiaryAccount: string;
  description?: string;
  externalId?: string;
};

export class IdezBankTransfersService {
  //trocar para del bank
  public async transfers(
    data: any,
    token: string,
    messageTest = "\nveio de outro canto cara",
  ) {
    console.log(messageTest);
    try {
      const response = await api.post(`/bank-transfers`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new IdezErrors().message(error);
    }
  }
  public async p2pTransfer(data: P2pTransferRequest, api_key: string) {
    try {
      const url = "/baas/api/v2/transfers";

      const idEmpotencyKey = generateIdempotencyKey();

      const response = await api.post(
        url,
        {
          amount: data.amount,
          description: data.description,
          beneficiaryAccount: data.beneficiaryAccount,
          externalId: data.externalId, //verificar utilidade desse campo futuramente
        },
        {
          headers: {
            IdempotencyKey: idEmpotencyKey,
            "x-delbank-api-key": api_key,
          },
        },
      );

      console.log(response.data);

      return response.data;

      // const response = await api.post(`/transfers`, data, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      // return response.data;
    } catch (error: any) {
      console.log(error.response.data.errors);

      throw new IdezErrors().message(error);
    }
  }
}
