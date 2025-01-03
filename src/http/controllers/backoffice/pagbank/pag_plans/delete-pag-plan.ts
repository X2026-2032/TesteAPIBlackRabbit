import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";

interface RequestParams {
  id: string;
}

export async function deletePagBank(
  request: FastifyRequest<{ Params: RequestParams }>,
  reply: FastifyReply,
) {
  try {
    const pagPlanId = request.params.id;

    await prisma.pagPlans.delete({
      where: {
        id: pagPlanId,
      },
    });

    return reply.status(200).send({ message: "PagBank deletado com sucesso." });
  } catch (error: any) {
    throw new AppError(error);
  }
}
