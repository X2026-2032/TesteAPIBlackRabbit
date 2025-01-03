import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function listNotifications(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const graphicAccount = await prisma.graphicAccount.findFirst({
      where: {
        id: request.user.sub,
      },
    });

    if (graphicAccount) {
      const notifications = await prisma.notifications.findMany({
        where: {
          graphicAccountId: graphicAccount.id,
        },
        orderBy: {
          created_at: "desc",
        },
        take: 20,
      });

      const quantity = notifications.filter(
        (notification) => !notification.isRead,
      );

      return reply.send({ notifications, quantity: quantity.length });
    }

    const user = await prisma.user.findUnique({
      where: { id: request.user.sub },
    });

    if (!user) throw new AppError({ message: "User not found", status: 404 });

    const account = await prisma.account.findFirst({
      where: { refId: user.refId || "" },
    });

    if (!account)
      throw new AppError({ message: "Account not found", status: 404 });

    const notifications = await prisma.notifications.findMany({
      where: {
        OR: [{ accountId: request.user.sub }, { accountId: account.id }],
      },
      orderBy: {
        created_at: "desc",
      },
      take: 20,
    });

    const quantity = notifications.filter(
      (notification) => !notification.isRead,
    );

    return reply.send({ notifications, quantity: quantity.length });
  } catch (error: any) {
    throw new AppError(error);
  }
}
