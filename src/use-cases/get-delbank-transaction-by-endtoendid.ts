import { api } from "@/lib/axios";
import { prisma } from "@/lib/prisma";

export default class GetDelbankTransactionByEndToEnd {
  static async execute(endToEndId: string, userId: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const graphic = await prisma.graphicAccount.findUnique({
        where: { id: userId },
      });

      const apiKey = user?.api_key || graphic?.virtual_account_id;

      if (!apiKey) {
        return;
      }

      const response = await api.get("/baas/api/v2/transactions", {
        params: {
          endToEndId,
        },
        headers: {
          "x-delbank-api-key": apiKey,
        },
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
