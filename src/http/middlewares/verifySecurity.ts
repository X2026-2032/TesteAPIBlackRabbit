import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function verifySecurity(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const queryParams = z.object({
    security_key: z.string(),
  });

  const { security_key } = queryParams.parse(request.query);

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

  if (graphicAccount.security_eletronic !== security_key) {
    reply.status(401).send({ error: "Chave de segurança inválida" });
    return;
  }
}
