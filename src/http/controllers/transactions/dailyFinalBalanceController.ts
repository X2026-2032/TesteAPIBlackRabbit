import { prisma } from "@/lib/prisma";
import { getDailyFinalBalances } from "@/use-cases/transactions/dailyFinalBalanceUseCase";
import { FastifyReply, FastifyRequest } from "fastify";

const dailyFinalBalanceController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = request?.user?.sub;

    const user = await prisma.user.findFirst({ where: { id: userId } });
    const graphic = await prisma.graphicAccount.findFirst({
      where: { id: userId },
    });

    const dailyFinalBalances = await getDailyFinalBalances(userId);
    reply.send(dailyFinalBalances);
  } catch (error) {
    reply
      .status(500)
      .send({ error: "Failed to retrieve daily final balances" });
  }
};

export default dailyFinalBalanceController;
