import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

interface RequestParams {
  id: string;
}

export async function updateTaxConfiguration(
  request: FastifyRequest<{ Params: RequestParams }>,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      id: z.string(),
      tax: z.number(),
      name: z.string(),
    });

    const data = bodySchema.parse(request.body);

    await prisma.$transaction(async (tx) => {
      await tx.taxConfigurationPOS.update({ where: { id: data.id }, data });

      return reply.status(200).send();
    });
  } catch (error: any) {
    throw new AppError(error);
  }
}
