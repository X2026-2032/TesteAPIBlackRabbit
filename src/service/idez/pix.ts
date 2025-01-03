import { api } from "@/lib/axios";
import { IdezErrors } from "./idez-errors";
import generateIdempotencyKey from "@/utils/generateIdempotencyKey";
import { PixTransferDelBankResponse } from "@/@types/types";

export type IdezPixTransfersRequest = {
  amount: number;
  key: string;
  id_tx?: string;
  description?: string;
};

export class IdezPixService {
  public async keys(key: string, token: string) {
    try {
      const response = await api.get(`/pix/keys/${key}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new IdezErrors().message(error);
    }
  }
  public async qrCodes(qrCode: string, api_key: string) {
    try {
      const response = await api.post(
        `/baas/api/v2/pix/qrcode/payment-initialization`,
        {
          payload: qrCode,
        },
        {
          headers: {
            "x-delbank-api-key": api_key,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      throw new IdezErrors().message(error);
    }
  }
  public async transfers(
    data: {
      endToEndId: string;
      amount: number;
      initiationType: string;
      description?: string;
      transactionId?: string;
    },
    api_key: string,
  ) {
    try {
      const idempotencyKey = generateIdempotencyKey();

      const createPixURL = "/baas/api/v2/transfers";

      const response = await api.post(createPixURL, data, {
        headers: {
          "x-delbank-api-key": api_key,
          IdempotencyKey: idempotencyKey,
        },
      });

      const pixData: PixTransferDelBankResponse = response.data;
      console.log("\n\n\n\nEXECUTOU O PIX:", pixData);

      return pixData;
    } catch (error: any) {
      throw new IdezErrors().message(error);
    }
  }
  public async verificationCode(type: string, token: string) {
    try {
      const response = await api.post(
        `/verification-code`,
        { type },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new IdezErrors().message(error);
    }
  }

  public async listKeys(bank_account_id: string) {
    try {
      const response = await api.get(
        `/banking/cashin/pix/keys?bank_account_id=${bank_account_id}`,
        {
          auth: {
            username: process.env.AUTH_USERNAME || "",
            password: process.env.AUTH_PASSWORD || "",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
}
