import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

export async function listPlans(request: FastifyRequest, reply: FastifyReply) {
  try {
    const plans = await prisma.plans.findMany();

    return reply.status(200).send(plans);
  } catch (error: any) {
    throw new AppError(error);
  }
}
