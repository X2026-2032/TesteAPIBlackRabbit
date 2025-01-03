import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function getSlipById(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const paramsSchema = z.object({
      id: z.string(),
    });

    const data = paramsSchema.parse(request.params);

    const slip = await prisma.bankSlip.findFirst({ where: { id: data.id } });

    if (!slip) return reply.status(404).send({ message: "Not found" });

    reply.send(slip);
  } catch (error: any) {
    throw new AppError(error);
  }
}
