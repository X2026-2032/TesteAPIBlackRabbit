import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";

export async function updateTaxConfigurations(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      id: z.string().uuid(),
      name: z.string().optional(),
      // subscription_plan: z.string().optional(),
      // user_id: z.string().optional(),
      tax: z.number().optional(),
      taxDefault: z.number().optional(),
      taxType: z.enum(["NUMBER", "PERCENTAGE"]).optional(),
      taxDefaultType: z.enum(["NUMBER", "PERCENTAGE"]).optional(),
    });

    const data = bodySchema.parse(request.body);

    await prisma.$transaction(async (tx) => {
      const tax = await tx.taxConfiguration.findFirst({
        where: { id: data.id },
      });

      if (!tax)
        throw new AppError({
          message: "Tax Configuration not found",
          status: 404,
        });

      const updatedTax = await tx.taxConfiguration.update({
        where: {
          id: tax.id,
        },
        data,
      });

      return reply.status(200).send(updatedTax);
    });
  } catch (error: any) {
    throw new AppError(error);
  }
}
