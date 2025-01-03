import { api } from "@/lib/axios";
import { IdezErrors } from "./idez-errors";
import FormData from "form-data";

export class IdezDocumentsService {
  public async execute(form: FormData, api_key: string) {
    try {
      const response = await api.post("/documents", form, {
        headers: {
          "x-delbank-api-key": api_key,
        },
      });
      return response.data;
    } catch (error: any) {
      console.log(error.response.data.errors);

      throw new IdezErrors().message(error);
    }
  }
}
