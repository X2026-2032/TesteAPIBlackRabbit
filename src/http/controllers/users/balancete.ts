import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { GetBalanceteUseCase } from "@/use-cases/users/balancete";
import { FastifyRequest, FastifyReply } from "fastify";

export async function balanceteController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const user_id = request.user.sub;

    const balancete = await new GetBalanceteUseCase().execute({
      user_id,
    });

    reply.status(200).send(balancete);
  } catch (error: any) {
    throw new AppError(error);
  }
}
