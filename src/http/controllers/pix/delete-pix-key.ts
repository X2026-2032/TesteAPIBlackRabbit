import { api } from "@/lib/axios";
import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import * as process from "node:process";

export async function deletePixKey(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const user_id = request.user.sub;

    const key_id = request.params as string;

    const user = await prisma.user.findFirst({ where: { id: user_id } });

    if (!user) {
      return reply.status(404).send();
    }

    const req = await api.post(`/banking/cashin/pix/keys/${key_id}/cancel`, {
      auth: {
        username: process.env.AUTH_USERNAME || "",
        password: process.env.AUTH_PASSWORD || "",
      },
    });

    return reply.status(200).send(req.data);
  } catch (error: any) {
    console.error(error);
    return;
  }
}
