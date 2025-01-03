import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

interface RequestParams {
  id: string;
}

export async function updateCardMachine(
  request: FastifyRequest<{ Params: RequestParams }>,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      serialNum: z.string(),
      identificationCode: z.string(),
      description: z.string(),
      name: z.string(),
    });

    const requestData = bodySchema.parse(request.body);

    const cardMachineId = request.params.id;

    const updatedCardMachine = await prisma.pagBankCardMachine.update({
      where: { id: cardMachineId },
      data: requestData,
    });

    return reply.status(200).send(updatedCardMachine);
  } catch (error: any) {
    throw new AppError(error);
  }
}
