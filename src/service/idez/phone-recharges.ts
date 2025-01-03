import { api } from "@/lib/axios";
import { DealerCode } from "@prisma/client";
import { IdezErrors } from "./idez-errors";

export type IdezPhoneRechargesRequest = {
  id?: string;
  amount: number;
  dealer_code: string;
  area_code: string;
  phone_number: string;
};
export type IdezPhoneRechargesConfirmRequest = {
  id: string;
  pin: string;
  amount: number;
};

export class IdezPhoneRechargesService {
  public async validate(data: IdezPhoneRechargesRequest, token: string) {
    try {
      const response = await api.post(`/phone-recharges`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { id, amounts, dealer_code, status } = response.data;
      return {
        id,
        status,
        amounts,
        dealer_code: this.dealerCodeMapper(dealer_code),
      };
    } catch (error) {
      throw new IdezErrors().message(error);
    }
  }
  public async confirm(data: IdezPhoneRechargesConfirmRequest, token: string) {
    try {
      console.log(data);
      const response = await api.post(
        `/phone-recharges/${data.id}/confirm`,
        {
          ...data,
          id: undefined,
        },
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
  public dealerCodeMapper = (aCode: "001" | "002" | "003" | "004") => {
    const codes = {
      "001": DealerCode.VIVO_01,
      "002": DealerCode.CLARO_02,
      "003": DealerCode.OI_03,
      "004": DealerCode.TIM_04,
    };

    return codes[aCode];
  };
}
