import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function updatePlans(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      id: z.string().uuid(),
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().min(0.01).positive().optional(),
      avaliableToRoles: z
        .array(z.enum(["MEMBERPJ", "MEMBERPF", "WALLET", "GRAPHIC"]))
        .optional(),
    });

    const data = bodySchema.parse(request.body);

    const editedPlan = await prisma.plans.update({
      where: { id: data.id },
      data,
    });

    return reply.status(200).send(editedPlan);
  } catch (error: any) {
    throw new AppError(error);
  }
}
