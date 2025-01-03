import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";
import { io } from "@/app";

export async function createTicketController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const schema = z.object({
      title: z.string(),
      description: z.string(),
      status: z.enum(["WAITING", "CLOSE", "OPEN"]).default("WAITING"),
      origem: z.string(),
      type: z.string(),
      category: z.string(),
      applicant: z.string(),
      assigned: z.string().default(""),
    });

    const ticketData = schema.parse(request.body);

    const ticketCount = (
      await prisma.ticket.findMany({
        where: {
          applicant: ticketData.applicant,
          AND: { OR: [{ status: "WAITING" }, { status: "OPEN" }] },
        },
      })
    ).length;
    console.log(ticketCount);

    if (ticketCount >= 15)
      throw new AppError({
        message: "Você ultrapassou o limite de tickets abertos",
      });

    const ticket = await prisma.ticket.create({ data: ticketData });

    io.emit(`ticketCreated-${ticket.assigned}`, {
      ...ticketData,
      messages: [],
    });

    return reply.status(201).send(ticket);
  } catch (error: any) {
    console.log(error);

    throw new AppError(error);
  }
}
