import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";

const feeLimitRequestSchema = z.object({
  availableFeePixIn: z.number(),
  availableFeePixOut: z.number(),
  availableFeeTedOut: z.number(),
  availableFeeP2pIn: z.number(),
  availableFeeP2pOut: z.number(),
  availableFeeBillet: z.number(),
  availableLimitDay: z.number(),
  availableLimitNightly: z.number(),
  availableLimitMonth: z.number(),
});

export async function configFeeLimit(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const userId = request?.user?.sub;
    const requestData = feeLimitRequestSchema.parse(request.body);

    const feeLimits = await prisma.feeLimits.findUnique({
      where: {
        graphic_account_id: userId,
      },
    });

    if (!feeLimits) {
      reply
        .status(404)
        .send({ message: "Limites não encontrados para o usuário." });
      return;
    }
    if (
      requestData.availableFeePixIn > feeLimits.feePixIn ||
      requestData.availableFeePixOut > feeLimits.feePixOut ||
      requestData.availableFeeTedOut > feeLimits.feeTedOut ||
      requestData.availableFeeP2pIn > feeLimits.feeP2pIn ||
      requestData.availableFeeP2pOut > feeLimits.feeP2pOut ||
      requestData.availableFeeBillet > feeLimits.feeBillet ||
      requestData.availableLimitDay > feeLimits.limitDay ||
      requestData.availableLimitNightly > feeLimits.limitNightly ||
      requestData.availableLimitMonth > feeLimits.limitMonth
    ) {
      reply.status(400).send({
        message:
          "O seu pedido de aumento excede o limite disponivel. Tente novamente com um valor menor.",
      });
      return;
    }

    await prisma.feeLimits.update({
      where: {
        graphic_account_id: userId,
      },
      data: {
        availableFeePixIn: requestData.availableFeePixIn,
        availableFeePixOut: requestData.availableFeePixOut,
        availableFeeTedOut: requestData.availableFeeTedOut,
        availableFeeP2pIn: requestData.availableFeeP2pIn,
        availableFeeP2pOut: requestData.availableFeeP2pOut,
        availableFeeBillet: requestData.availableFeeBillet,
        availableLimitDay: requestData.availableLimitDay,
        availableLimitNightly: requestData.availableLimitNightly,
        availableLimitMonth: requestData.availableLimitMonth,
      },
    });

    reply.send({ message: "Limites atualizados com sucesso." });
  } catch (error: any) {
    throw new AppError(error);
  }
}
