import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";

export async function getUserAddressById(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { userId }: any = request.params;
    const user = await prisma.user.findFirst({ where: { id: userId } });

    if (!user) throw new AppError({ message: "User not found", status: 404 });

    const graphicAccount = await prisma.graphicAccount.findFirst({
      where: { user_id: user.id },
    });

    if (!graphicAccount)
      throw new AppError({ message: "Graphic Account not found", status: 404 });

    const address = await prisma.address.findFirst({
      where: { graphicId: graphicAccount.id },
    });

    if (!address)
      throw new AppError({ message: "Address not found", status: 404 });

    return reply.status(201).send(address);
  } catch (error) {
    throw new AppError(error as Error);
  }
}
