import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { IdezPaymentsService } from "@/service/idez/payments";
import { z } from "zod";

export async function getSlipInfo(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const querySchema = z.object({
      digitableLine: z.string({ required_error: "Linha digitável inválida" }),
    });

    const { digitableLine } = querySchema.parse(request.params);

    const userId = request.user.sub;

    const user = await prisma.user.findFirst({ where: { id: userId } });
    const graphic = await prisma.graphicAccount.findFirst({
      where: { id: userId },
    });

    const someApiKey = user?.api_key || graphic?.virtual_account_id;

    if (!someApiKey)
      throw new AppError({ message: "Api key is required for this action" });

    const slipInfo = await new IdezPaymentsService().getSlipInfo(
      { digitableLine },
      someApiKey,
    );

    if (!slipInfo) {
      return reply.status(404).send();
    }

    return reply.status(200).send(slipInfo);
  } catch (error: any) {
    throw new AppError(error);
  }
}
