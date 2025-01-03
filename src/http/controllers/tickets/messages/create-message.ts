import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";
import { io } from "@/app";

export async function createMessageController(
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

    const { content } = request.body as { content: string };
    const author = request.user?.sub;

    if (!author) {
      throw new Error("Author not found in request context.");
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        ticketId: ticket.id,
        author,
      },
      include: {
        ticket: true,
      },
    });

    io.emit(`ticket-new-message`, {
      ...newMessage,
      ticket: undefined,
      ticketId: newMessage.ticket.id,
    });

    return reply.status(201).send({
      ...newMessage,
      ticket: undefined,
      ticketId: newMessage.ticket.id,
    });
  } catch (error: any) {
    throw new AppError(error);
  }
}
