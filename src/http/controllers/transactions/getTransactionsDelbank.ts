import axios from "axios";
import { FastifyReply, FastifyRequest } from "fastify";

export const getTransactionsDelbank = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { api_key, page, endDate, startDate, isCredit, endToEndId }: any =
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
      "https://api.delbank.com.br/baas/api/v2/transactions",
      {
        params: {
          page,
          limit: 9999999,
          startDate,
          endDate,
          endToEndId,
          ...whereContition,
        },
        headers: {
          "x-delbank-api-key": api_key,
        },
      },
    );

    const count = await axios.get(
      "https://api.delbank.com.br/baas/api/v2/transactions",
      {
        params: {
          limit: 9999999,
          startDate,
          endDate,
          endToEndId,
          ...whereContition,
        },
        headers: {
          "x-delbank-api-key": api_key,
        },
      },
    );

    const { data } = response;
    return reply.status(200).send({ data, count: count.data.length });
  } catch (err: any) {
    console.log(err);
    throw new Error(err);
  }
};
