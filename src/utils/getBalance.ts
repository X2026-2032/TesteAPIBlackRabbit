import { api } from "@/lib/axios";

async function getBalance(
  api_key: string,
): Promise<{ amountAvailable: number } | null> {
  const baseUrl = "/baas/api/v1/balances";

  const config = {
    headers: {
      "x-delbank-api-key": api_key,
    },
  };

  try {
    const response = await api.get(baseUrl, config);

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export { getBalance };
