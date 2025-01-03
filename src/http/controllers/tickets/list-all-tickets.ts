import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";

export async function listAllTicketController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const userId = request.user.sub;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const graphic = await prisma.graphicAccount.findUnique({
      where: { id: userId },
    });

    if (!user && !graphic)
      throw new AppError({ message: "User not found", status: 404 });

    let tickets: any = [];

    if (user) {
      if (
        user.role == "ADMIN" ||
        user.role == "ADMIN_BAG" ||
        user.role == "MASTER"
      ) {
        tickets = await prisma.ticket.findMany({
          orderBy: {
            created_at: "desc",
          },
          where: {
            OR: [
              { assigned: user.id },
              { assigned: "", status: "WAITING" },
              { applicant: user.id },
            ],
          },
          include: {
            messages: true,
          },
        });
      } else {
        tickets = await prisma.ticket.findMany({
          orderBy: {
            created_at: "desc",
          },
          where: {
            OR: [{ applicant: user.id }, { assigned: user.id }],
          },
          include: {
            messages: true,
          },
        });
      }
    }

    if (graphic) {
      tickets = await prisma.ticket.findMany({
        orderBy: {
          created_at: "desc",
        },
        where: {
          OR: [{ applicant: graphic.id }, { assigned: graphic.id }],
        },
        include: {
          messages: true,
        },
      });
    }

    return reply.status(200).send(tickets);
  } catch (error: any) {
    throw new AppError(error);
  }
}
