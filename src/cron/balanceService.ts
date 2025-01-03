import { api } from "@/lib/axios";
import { AppError } from "@/use-cases/errors/app-error";

export async function fetchBalanceEndNight(
  userId: string | undefined,
  someApiKey: string,
) {
  try {
    if (!someApiKey) {
      throw new AppError({ message: "Api key is required for this action" });
    }

    const headers = {
      "x-delbank-api-key": someApiKey,
    };

    // Fazendo a solicitação GET usando Axios
    const response = await api.get("/baas/api/v1/balances", {
      headers,
    });

    return response.data;
  } catch (error) {
    throw new AppError({ message: "Erro ao obter os saldos", error });
  }
}
