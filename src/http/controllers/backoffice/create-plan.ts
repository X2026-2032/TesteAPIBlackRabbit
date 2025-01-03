import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createPlans(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      name: z.string(),
      description: z.string(),
      price: z.number().min(0.01).positive(),
      avaliableToRoles: z
        .array(z.enum(["MEMBERPJ", "MEMBERPF", "WALLET", "GRAPHIC"]))
        .default(["MEMBERPJ", "MEMBERPF", "WALLET", "GRAPHIC"]),
    });

    const data = bodySchema.parse(request.body);

    const createdPlan = await prisma.plans.create({ data });

    return reply.status(201).send(createdPlan);
  } catch (error: any) {
    throw new AppError(error);
  }
}
