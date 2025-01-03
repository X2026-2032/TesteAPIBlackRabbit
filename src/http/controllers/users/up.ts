import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";

export async function up(request: FastifyRequest, reply: FastifyReply) {
  const data = request.body as object;

  await prisma.upbrand.create({
    data: {
      data,
    },
  });

  return { ok: "OK" };
}
