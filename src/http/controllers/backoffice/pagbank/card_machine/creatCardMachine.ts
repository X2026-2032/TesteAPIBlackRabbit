import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createCardMachine(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      serialNum: z.string(),
      identificationCode: z.string(),
      description: z.string(),
      graphic_account_id: z.string(),
      machinePlanId: z.string(),
    });

    const data = bodySchema.parse(request.body);

    const createdMachine = await prisma.pagBankCardMachine.create({
      data: {
        ...data,
      },
      include: {
        graphicAccount: true,
      },
    });

    return reply.status(201).send(createdMachine);
  } catch (error: any) {
    throw new AppError(error);
  }
}
