import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";
import { api } from "@/lib/axios";
import { AxiosResponse } from "axios";

interface LimitType {
  name: string;
  description: string;
}

export interface Limit {
  limitType: LimitType;
  maximunAmount: number;
  definedAmount: number;
}

interface ServiceType {
  name: string;
  description: string;
}

export interface ServiceLimits {
  serviceType: ServiceType;
  limits: Limit[];
}

export async function showFeeLimitMaster(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const userId = request?.user?.sub;

    const existingFeeLimit = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        FeeLimits: true,
        FeeLimitChangeRequest: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`Usuário não encontrado`);
    }

    const apiKey = user.api_key;

    const url = `/baas/api/v1/usage-limits`;

    const headers = {
      "x-delbank-api-key": apiKey,
    };

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

      return reply.status(200).send(transformedData);
    } else {
      throw new Error(`Erro ao obter os limites de uso: ${response.status}`);
    }
  } catch (error: any) {
    throw new AppError(error);
  }
}
