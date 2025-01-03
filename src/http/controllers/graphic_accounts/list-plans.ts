import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function listPlans(
  request: FastifyRequest<{ Querystring: { role?: string } }>,
  reply: FastifyReply,
) {
  try {
    const { query } = request;

    const role = query.role;

    const plans = await prisma.plans.findMany();

    const filteredPlans = role
      ? plans.filter((p) => p.avaliableToRoles.find((atr) => atr == role))
      : plans;

    return reply.status(200).send(filteredPlans);
  } catch (error: any) {
    throw new AppError(error);
  }
}
