import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

export async function fetchAllGraphicAccounts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const users = await prisma.graphicAccount.findMany({
      orderBy: { created_at: "desc" },
    });

    return reply.status(200).send(users);
  } catch (error) {
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function fetchGraphicAccounts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    // Pega o parâmetro de rota
    const { userName } = request.params as { userName: string };
    console.log("userName recebido na rota:", userName);

    if (!userName) {
      return reply
        .status(400)
        .send({ error: "O parâmetro 'userName' é obrigatório." });
    }

    const existUserName = await prisma.graphicAccount.findUnique({
      where: { userName },
    });

    if (!existUserName) {
      return reply
        .status(404)
        .send({ error: "Nenhuma conta encontrada com esse userName." });
    }

    return reply.status(200).send(existUserName);
  } catch (error) {
    console.error("Erro ao buscar graphicAccount:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
