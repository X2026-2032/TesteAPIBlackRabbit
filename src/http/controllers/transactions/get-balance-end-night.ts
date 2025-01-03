import { fetchBalanceEndNight } from "@/cron/balanceService";
import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

async function fetchBalanceEndNightHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request?.user?.sub;

    const user = await prisma.user.findFirst({ where: { id: userId } });
    const graphic = await prisma.graphicAccount.findFirst({
      where: { id: userId },
    });

    const someApiKey = user?.api_key || graphic?.virtual_account_id;

    const responseData = await fetchBalanceEndNight(
      userId,
      someApiKey as string,
    );

    // Retornando os dados da resposta para o cliente
    reply.send(responseData);
  } catch (error) {
    // Se ocorrer um erro, retornar uma resposta de erro para o cliente
    reply.code(500).send({ error: "Erro ao obter os saldos", message: error });
  }
}

export default fetchBalanceEndNightHandler;
