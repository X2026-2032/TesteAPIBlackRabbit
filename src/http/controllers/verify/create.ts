import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

export const CreateVerifyData = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { data, rg_cnh } = request.body as { data: any; rg_cnh: string };
    const document = await prisma.verifyAuth.create({
      data: {
        data,
        rg_cnh,
      },
    });
    reply.send(document);
  } catch (err: any) {
    throw new Error(err);
  }
};
