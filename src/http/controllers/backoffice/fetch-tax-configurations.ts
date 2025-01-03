import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";

export async function fetchTaxConfigurations(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const taxes = await prisma.taxConfiguration.findMany({
      orderBy: { name: "asc" },
    });

    return reply.status(200).send(taxes);
  } catch (error: any) {
    throw new AppError(error);
  }
}
