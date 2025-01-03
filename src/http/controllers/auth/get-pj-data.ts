import { AppError } from "@/use-cases/errors/app-error";
import axios from "axios";
import { FastifyReply, FastifyRequest } from "fastify";

export async function getPjData(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { cnpj }: any = request.params;

    const responsePJ = await axios.get(
      `https://receitaws.com.br/v1/cnpj/${cnpj}/days/45`,
      {
        headers: {
          Authorization:
            "Bearer f64f65f172c1199819eca5113f73a10f62da740268a84a71505ad4c35ce6f97a",
        },
      },
    );

    return reply.status(200).send(responsePJ.data);
  } catch (error: any) {
    throw new AppError(error);
  }
}
