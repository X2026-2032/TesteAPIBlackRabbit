import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function fetchNotifications(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const tickets = await prisma.ticket.count({
      where: {
        status: "WAITING",
      },
    });

    const feeLimitsRequests = await prisma.feeLimitChangeRequest.count({
      where: {
        status: "waiting",
      },
    });

    const graphicAccounts = await prisma.graphicAccount.count({
      where: {
        status: "under_review",
      },
    });

    const users = await prisma.user.count({
      where: {
        status: "PENDING_DOCUMENTATION",
      },
    });

    const totalPendingItems =
      tickets + feeLimitsRequests + graphicAccounts + users;

    const response = {
      tickets,
      feeLimitsRequests,
      graphicAccounts,
      users,
      totalPendingItems,
    };

    return reply.status(200).send(response);
  } catch (error: any) {
    throw new AppError(error);
  }
}
