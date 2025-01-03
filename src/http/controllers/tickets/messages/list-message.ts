import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";

export async function listMessagesController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { number } = request.params as { number: string };

    const ticket = await prisma.ticket.findUnique({
      where: {
        number: parseInt(number),
      },
    });

    if (!ticket) return reply.status(404).send();

    const messages = await prisma.message.findMany({
      where: {
        ticketId: ticket.id,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    return reply.send(messages);
  } catch (error: any) {
    throw new AppError(error);
  }
}
