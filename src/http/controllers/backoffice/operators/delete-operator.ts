import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

export async function deleteOperator(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const paramsSchema = z.object({
      id: z.string(),
    });

    const { id } = paramsSchema.parse(request.params);

    const existingOperator = await prisma.operatos.findUnique({
      where: { id },
    });

    if (!existingOperator) {
      return reply.status(404).send({ message: "Operador não encontrado." });
    }

    await prisma.operatos.delete({ where: { id } });

    return reply
      .status(200)
      .send({ message: "Operador excluído com sucesso." });
  } catch (error: any) {
    throw new AppError(error);
  }
}
