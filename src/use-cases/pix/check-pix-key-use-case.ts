import { api } from "@/lib/axios";
import { AppError } from "../errors/app-error";

type CheckPixKeyUseCaseRequest = {
  userId: string;
  key: string;
};

export type CheckPixUseCaseResponse = {
  key: {
    data: {
      data: {
        counterparty: {
          bank_account: {
            account_digit: string;
            account_number: string;
            account_type: string;
            bank_ispb: string;
            bank_number: string;
            branch: string;
            id: string;
            inserted_at: string;
            updated_at: string;
          };
          company_id: string;
          external_id: string | null;
          id: string;
          inserted_at: string;
          ledger_type: string;
          maximum_amount: string | null;
          maximum_transactions: string | null;
          name: string;
          tax_number: string;
          updated_at: string;
        };
        entity_id: string;
        id: string;
        inserted_at: string;
        key: string;
        type: string;
        updated_at: string;
      };
    };
  };
  bank: {
    data: {
      data: {
        authorized?: boolean;
        display_name?: string;
        full_name?: string;
        id?: string;
        ispb?: string;
        name?: string;
        number?: string;
      };
    };
  };
};

export class CheckPixKeyUseCase {
  constructor() {}

  public async execute(
    input: CheckPixKeyUseCaseRequest,
  ): Promise<CheckPixUseCaseResponse> {
    try {
      const keyInfo = await api.post(
        `/banking/cashout/pix/keys/check`,
        {
          entity_id: process.env.ENTITY_ID as string,
          key: input.key,
        },
        {
          auth: {
            username: process.env.AUTH_USERNAME || "",
            password: process.env.AUTH_PASSWORD || "",
          },
        },
      );

      const bankInfo = await api.get(`/banking/institutions`, {
        params: {
          ispb: keyInfo.data.data.counterparty.bank_account.bank_ispb,
        },
        auth: {
          username: process.env.AUTH_USERNAME || "",
          password: process.env.AUTH_PASSWORD || "",
        },
      });

      return { key: keyInfo.data, bank: bankInfo.data };
    } catch (error: any) {
      throw new AppError({
        message: "Erro ao consultar chave Pix",
      });
    }
  }
}
