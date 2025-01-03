import { prisma } from "@/lib/prisma";
import { AppError } from "./errors/app-error";
import { api } from "@/lib/axios";

export class UpdateUserBalance {
  static async execute(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId, api_key: { not: null } },
      });

      if (!user) throw new AppError({ message: "User not found", status: 404 });
      if (!user.refId)
        throw new AppError({ message: "User not found", status: 404 });
      const userAccount = await prisma.account.findFirst({
        where: { refId: user.refId },
      });

      if (!userAccount)
        throw new AppError({ message: "User not found", status: 404 });

      const response = await api.get("/baas/api/v1/balances", {
        headers: {
          "x-delbank-api-key": user.api_key,
        },
      });

      const balance = response?.data?.amountAvailable;

      if (!balance)
        throw new AppError({
          message: "amountAvailable not found",
          status: 404,
        });

      await prisma.account.update({
        where: { id: userAccount.id },
        data: { balance },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
