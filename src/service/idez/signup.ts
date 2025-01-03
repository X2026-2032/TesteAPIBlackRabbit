import { IdezErrors } from "./idez-errors";
import { api } from "@/lib/axios";

export type IdezSignupServiceRequest = {};

export class IdezSignupService {
  public async execute(data: any, type: string) {
    try {
      const response = await api.post(
        "/baas/api/v1/customers/person-legal",
        {
          ...data,
        },
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "x-delbank-api-key": process.env.MASTER_API_KEY,
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.error("\n\n", error.response.data.errors);
      // console.error(error);
      throw new IdezErrors().message(error);
    }
  }
}
