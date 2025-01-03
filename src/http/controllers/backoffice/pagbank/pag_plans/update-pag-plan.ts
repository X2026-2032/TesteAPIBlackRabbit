import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

interface RequestParams {
  id: string;
}

export async function updatePagBank(
  request: FastifyRequest<{ Params: RequestParams }>,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      name: z.string(),
    });

    const data = bodySchema.parse(request.body);

    const pagPlanId = request.params.id;

    if (!pagPlanId)
      throw new AppError({ message: "PlanId is required", status: 400 });

    const updatedPagPlan = await prisma.pagPlans.update({
      where: {
        id: pagPlanId,
      },
      data: {
        name: data.name,
      },
    });

    return reply.status(200).send(updatedPagPlan);
  } catch (error: any) {
    throw new AppError(error);
  }
}
