import { io } from "@/app";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

export async function updateTicket(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const bodySchema = z.object({
      assignedBy: z.string().optional(), //backoffice userId
      status: z.enum(["WAITING", "OPEN", "CLOSE"]),
      id: z.string(),
    });

    const data = bodySchema.parse(request.body);

    const updatedTicket = await prisma.ticket.update({
      where: {
        id: data.id,
      },
      data: {
        status: data.status,
        assigned: data.assignedBy,
      },
      include: { messages: true },
    });

    if (!updatedTicket) return reply.status(400).send();

    io.emit("updateTicket", updatedTicket);

    return reply.status(200).send(updatedTicket);
  } catch (error: any) {
    throw new AppError(error);
  }
}
