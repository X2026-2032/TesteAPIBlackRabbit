import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function deleteCardMachine(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const paramsSchema = z.object({
      id: z.string(),
    });

    const { id } = paramsSchema.parse(request.params);

    await prisma.pagBankCardMachine.delete({ where: { id } });

    return reply.status(200).send({ message: "Card machine deleted" });
  } catch (error: any) {
    throw new AppError(error);
  }
}
