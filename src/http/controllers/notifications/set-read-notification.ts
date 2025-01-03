import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function setReadNotifications(
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
      await prisma.notifications.updateMany({
        where: {
          graphicAccountId: graphicAccount.id,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      const notifications = await prisma.notifications.findMany({
        where: {
          graphicAccountId: graphicAccount.id,
        },
        orderBy: {
          created_at: "desc",
        },
        take: 20,
      });

      return reply.send({ notifications, quantity: 0 });
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

    await prisma.notifications.updateMany({
      where: {
        OR: [{ accountId: request.user.sub }, { accountId: account.id }],
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    const notifications = await prisma.notifications.findMany({
      where: {
        OR: [{ accountId: request.user.sub }, { accountId: account.id }],
      },
      orderBy: {
        created_at: "desc",
      },
      take: 20,
    });

    return reply.send({ notifications, quantity: 0 });
  } catch (error: any) {
    throw new AppError(error);
  }
}
