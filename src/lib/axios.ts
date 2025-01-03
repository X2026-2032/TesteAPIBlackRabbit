import axios, { AxiosError } from "axios";
import https from "https";
import fs from "fs";
import { env } from "@/env";

interface ResponseError {
  code: string;
  message: string;
  data: Array<any>;
}

const httpsAgent = new https.Agent({
  cert: fs.readFileSync("ajiopay.pem"),
  key: fs.readFileSync("myserver.key"),
});

const api = axios.create({
  baseURL: env.IDEZ_API_URL,
  // httpsAgent,
});

const requestError = (err: any) => {
  if (err instanceof AxiosError) {
    const error = err as AxiosError;
    const response = error.response?.data as ResponseError;

    return {
      status: error.status,
      code: response.code,
      message: response.message,
      data: response?.data || [],
    };
  }

  return err;
};

export { api, requestError };
