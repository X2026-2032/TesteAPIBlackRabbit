import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";
import { api } from "@/lib/axios";

export async function RequestLimitDelbank(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const userId = request?.user?.sub;
    const { pix, billet, requestType } = request.body as any;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`Usuário não encontrado`);
    }

    const apiKey = user.api_key;
    const url = `/baas/api/v1/usage-limits`;
    const headers = { "x-delbank-api-key": apiKey };

    const createPayload = (
      serviceType: string,
      dailyTotal: number,
      transactionalTotal: number,
    ) => ({
      serviceType,
      limits: [
        {
          limitType: "DAYTIME_TOTAL",
          maximunAmount: dailyTotal,
          definedAmount: dailyTotal,
        },
        {
          limitType: "NIGHTTIME_TOTAL",
          maximunAmount: dailyTotal,
          definedAmount: dailyTotal,
        },
        {
          limitType: "DAYTIME_TRANSACTIONAL",
          maximunAmount: transactionalTotal,
          definedAmount: transactionalTotal,
        },
        {
          limitType: "NIGHTTIME_TRANSACTION",
          maximunAmount: transactionalTotal,
          definedAmount: transactionalTotal,
        },
      ],
    });

    const pixPayload = createPayload(
      "PIX",
      Number(pix.DAYTIME_TOTAL),
      Number(pix.DAYTIME_TRANSACTIONAL),
    );
    const billetPayload = createPayload(
      "PAYMENT",
      Number(billet.DAYTIME_TOTAL),
      Number(billet.DAYTIME_TRANSACTIONAL),
    );

    const sendRequest = async (payload: any) => {
      const response = await api.put(url, payload, { headers });
      return response.data;
    };

    if (requestType === "pix") {
      const responseData = await sendRequest(pixPayload);
      return reply.status(200).send(responseData);
    }

    if (requestType === "billet") {
      const responseData = await sendRequest(billetPayload);
      return reply.status(200).send(responseData);
    }

    if (requestType === "billet_and_pix") {
      const [responseBillet, responsePix] = await Promise.all([
        sendRequest(billetPayload),
        sendRequest(pixPayload),
      ]);

      return reply.status(200).send({
        responseBillet,
        responsePix,
      });
    }
  } catch (error: any) {
    console.error(error);
    throw new AppError(error.message || "Erro desconhecido");
  }
}
