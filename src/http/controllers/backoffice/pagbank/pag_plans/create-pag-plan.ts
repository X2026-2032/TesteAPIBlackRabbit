import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createPagPlan(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      name: z.string(),
    });

    const data = bodySchema.parse(request.body);

    await prisma.$transaction(async (tx) => {
      const createdPagPlan = await tx.pagPlans.create({
        data: {
          name: data.name,
        },
      });

      for (let i = 0; i < 19; i++) {
        await tx.taxConfigurationPOS.create({
          data: {
            name: i == 0 ? "Débito" : i == 1 ? "1x Crédito a vista" : `${i}x`,
            pagPlansId: createdPagPlan.id,
            tax: 0,
            installments: i,
          },
        });
      }
    });

    const pagPlan = await prisma.pagPlans.findFirst({
      where: {
        id: createdPagPlan.id,
      },
      include: {
        taxes: true,
      },
    });

    if (!pagPlan) return reply.status(400).send({ error: "Algo deu errado" });

    return reply.status(201).send(pagPlan);
  } catch (error: any) {
    throw new AppError(error);
  }
}
