import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";
import { AxiosResponse } from "axios";
import { api } from "@/lib/axios";
import { Limit, ServiceLimits } from "./show-fee-limits-master";

export async function configFeeMasterLimit(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const userId = request?.user?.sub;

    const { pix, billet } = request.body as any;

    let feeLimitId = "";

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`Usuário não encontrado`);
    }

    const feeLimits = await prisma.feeLimits.findFirst({
      where: {
        userId,
      },
    });

    const apiKey = user.api_key;

    const url = `/baas/api/v1/usage-limits`;

    const headers = {
      "x-delbank-api-key": apiKey,
    };

    if (feeLimits === null) {
      const newFeeLimit = await prisma.feeLimits.create({
        data: {
          userId,
          graphic_account_id: undefined,
          limitPixDay: 0,
        },
      });

      feeLimitId = newFeeLimit.id;

      const response: AxiosResponse<ServiceLimits[]> = await api.get(url, {
        headers,
      });

      if (response.status === 200) {
        const data: ServiceLimits[] = response.data;

        const transformedData = data.map((item: ServiceLimits) => ({
          serviceType: item.serviceType,
          limits: item.limits.map((limit: Limit) => ({
            limitType: limit.limitType,
            maximunAmount: limit.maximunAmount,
            definedAmount: limit.definedAmount,
          })),
        }));

        transformedData.map(async (item) => {
          if (item.serviceType.name === "PIX") {
            for (const itemLimit of item.limits) {
              if (itemLimit.limitType.name === "DAYTIME_TOTAL") {
                const updatedFeeLimit = await prisma.feeLimits.update({
                  data: {
                    limitPixDay: itemLimit.definedAmount,
                  },
                  where: {
                    id: newFeeLimit.id,
                  },
                });
              }

              if (itemLimit.limitType.name === "NIGHTTIME_TOTAL") {
                const updatedFeeLimit = await prisma.feeLimits.update({
                  data: {
                    limitPixNightly: itemLimit.definedAmount,
                  },
                  where: {
                    id: newFeeLimit.id,
                  },
                });
              }

              if (itemLimit.limitType.name === "DAYTIME_TRANSACTIONAL") {
                const updatedFeeLimit = await prisma.feeLimits.update({
                  data: {
                    limitPixDayTransaction: itemLimit.definedAmount,
                  },
                  where: {
                    id: newFeeLimit.id,
                  },
                });
              }

              if (itemLimit.limitType.name === "NIGHTTIME_TRANSACTION") {
                const updatedFeeLimit = await prisma.feeLimits.update({
                  data: {
                    limitPixNightlyTransaction: itemLimit.definedAmount,
                  },
                  where: {
                    id: newFeeLimit.id,
                  },
                });
              }
            }
          }
          if (item.serviceType.name === "PAYMENT") {
            for (const itemLimit of item.limits) {
              if (itemLimit.limitType.name === "DAYTIME_TOTAL") {
                const updatedFeeLimit = await prisma.feeLimits.update({
                  data: {
                    limitBilletDay: itemLimit.definedAmount,
                  },
                  where: {
                    id: newFeeLimit.id,
                  },
                });
              }

              if (itemLimit.limitType.name === "NIGHTTIME_TOTAL") {
                const updatedFeeLimit = await prisma.feeLimits.update({
                  data: {
                    limitBilletNightly: itemLimit.definedAmount,
                  },
                  where: {
                    id: newFeeLimit.id,
                  },
                });
              }

              if (itemLimit.limitType.name === "DAYTIME_TRANSACTIONAL") {
                const updatedFeeLimit = await prisma.feeLimits.update({
                  data: {
                    limitBilletDayTransaction: itemLimit.definedAmount,
                  },
                  where: {
                    id: newFeeLimit.id,
                  },
                });
              }

              if (itemLimit.limitType.name === "NIGHTTIME_TRANSACTION") {
                const updatedFeeLimit = await prisma.feeLimits.update({
                  data: {
                    limitBilletNightlyTransaction: itemLimit.definedAmount,
                  },
                  where: {
                    id: newFeeLimit.id,
                  },
                });
              }
            }
          }
        });

        return;
      } else {
        throw new Error(`Erro ao obter os limites de uso: ${response.status}`);
      }
    }

    await prisma.feeLimits.update({
      where: {
        id: feeLimits !== null ? feeLimits.id : feeLimitId,
      },
      data: {
        limitPixDay: Number(pix.DAYTIME_TOTAL),
        limitPixNightly: Number(pix.NIGHTTIME_TOTAL),
        limitPixDayTransaction: Number(pix.DAYTIME_TRANSACTIONAL),
        limitPixNightlyTransaction: Number(pix.NIGHTTIME_TRANSACTION),
        limitBilletDay: Number(billet.DAYTIME_TOTAL),
        limitBilletNightly: Number(billet.NIGHTTIME_TOTAL),
        limitBilletDayTransaction: Number(billet.DAYTIME_TRANSACTIONAL),
        limitBilletNightlyTransaction: Number(billet.NIGHTTIME_TRANSACTION),
      },
    });

    reply.send({ message: "Limites atualizados com sucesso." });
  } catch (error: any) {
    throw new AppError(error);
  }
}
