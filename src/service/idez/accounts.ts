import { IdezErrors } from "./idez-errors";
import { api } from "@/lib/axios";

export type IdezBiometricRequest = {
  documentType: string;
  base64: string;
};
export class IdezAccounts {
  public async documents(data: IdezBiometricRequest, customerDocument: string) {
    try {
      const response = await api.post(
        `/baas/api/v1/customers/${customerDocument}/documents`,
        data,
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "x-delbank-api-key": process.env.MASTER_API_KEY,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      console.log(
        "erro na delbank, envio de documento. \ndocumentType:",
        data.documentType,
        "\n\n ERRO:",
        error.response.data.errors,
      );

      throw new IdezErrors().message(error);
    }
  }

  public async people(data: any) {
    try {
      const response = await api.post(
        "/baas/api/v1/customers/person-natural",
        data,
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-delbank-api-key": process.env.MASTER_API_KEY,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new IdezErrors().message(error);
    }
  }
}
