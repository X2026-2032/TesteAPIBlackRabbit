import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";

export async function getByIdOperator(
  request: FastifyRequest<{ Params: { id: string } }>, // Especifica o tipo de parâmetro de rota
  reply: FastifyReply,
) {
  try {
    const operatorId = request.params.id;

    const operator = await prisma.operatos.findUnique({
      where: {
        id: operatorId,
      },
    });

    if (!operator) {
      return reply.status(404).send({ message: "Operador não encontrado" });
    }

    return reply.status(200).send(operator);
  } catch (error: any) {
    throw new AppError(error);
  }
}
