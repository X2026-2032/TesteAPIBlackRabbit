import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function verifySecurity(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const queryParams = z.object({
    password_hash: z.string(),
  });

  const { password_hash } = queryParams.parse(request.query);

  const user_id = request.user.sub;

  const graphicAccount = await prisma.graphicAccount.findFirst({
    where: {
      id: user_id,
    },
  });

  if (!graphicAccount) {
    reply.status(404).send({ error: "Conta não encontrada" });
    return;
  }

  if (graphicAccount.password_hash !== password_hash) {
    reply.status(401).send({ error: "Chave de segurança inválida" });
    return;
  }
}
