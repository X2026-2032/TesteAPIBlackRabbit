import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function listUsers(request: FastifyRequest, reply: FastifyReply) {
  try {
    const users = await prisma.graphicAccount.findMany({
      where: { role: "WALLET" },
    });

    return reply.status(200).send(users);
  } catch (error: any) {
    throw new AppError(error);
  }
}
