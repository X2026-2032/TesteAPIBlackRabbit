import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest } from "fastify";
import { FastifyReply } from "fastify/types/reply";

export async function FindByIdTicketController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const { id } = request.params as { id: string };

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: id,
      },
    });

    if (!ticket) {
      return reply.status(404).send({ message: "Ticket not found" });
    }

    return reply.status(200).send(ticket);
  } catch (error: any) {
    throw new AppError(error);
  }
}
