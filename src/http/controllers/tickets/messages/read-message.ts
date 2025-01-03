import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";

export async function readMessageController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { id } = request.params as { id: string };

    const message = await prisma.message.findUnique({
      where: {
        id: id,
      },
    });

    if (!message) return reply.status(404).send();

    const updatedMessage = await prisma.message.update({
      where: {
        id: id,
      },
      data: {
        read: true,
      },
    });

    return reply.status(200).send(updatedMessage);
  } catch (error: any) {
    throw new AppError(error);
  }
}
