import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";

export async function deleteTicketController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { id } = request.params as { id: string };

    await prisma.ticket.delete({
      where: {
        id: id,
      },
    });

    return reply.status(204).send();
  } catch (error: any) {
    throw new AppError(error);
  }
}
