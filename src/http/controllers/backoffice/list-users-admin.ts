import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function listUsersAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["MEMBER", "MASTER", "ADMIN", "ADMIN_BAG"],
        },
        status: "ACTIVE",
      },
    });

    return reply.status(200).send(users);
  } catch (error: any) {
    throw new AppError(error);
  }
}
