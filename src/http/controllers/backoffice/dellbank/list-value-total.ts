import { api } from "@/lib/axios";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function listValueTotal(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { id }: any = request.params;

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    let dellBankBalance;
    try {
      dellBankBalance = await api.get("/baas/api/v1/balances", {
        headers: {
          "x-delbank-api-key": user?.api_key,
        },
      });
    } catch (delbankError) {
      console.error("Error fetching Delbank balance:", delbankError);
      dellBankBalance = null;
    }

    const account = await prisma.account.findFirst({
      where: {
        user_id: id,
      },
    });

    if (!account) {
      throw new AppError({ message: "Conta não encontrada", status: 404 });
    }

    return reply.status(200).send({
      dellBankBalance: dellBankBalance!.data.amountAvailable,
      accountBalance: account.balance,
    });
  } catch (error: any) {
    throw new AppError(error);
  }
}
