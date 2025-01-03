import axios from "axios";
import { FastifyReply, FastifyRequest } from "fastify";

export const getAllTransactionsDelbank = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { api_key, endDate, startDate, isCredit, endToEndId }: any =
      request.query;

    let whereContition = {};
    if (isCredit) {
      whereContition = {
        isCredit,
      };
    } else {
      whereContition = {};
    }

    const response = await axios.get(
      "https://apisandbox.delbank.com.br/baas/api/v1/transactions",
      {
        params: {
          limit: 9999999,
          endDate,
          startDate,
          endToEndId,
          isCredit,
          ...whereContition,
        },
        headers: {
          "x-delbank-api-key": api_key,
        },
      },
    );

    const { data } = response;
    return reply.status(200).send({ data });
  } catch (err: any) {
    console.error(err);
    throw new Error(err);
  }
};
