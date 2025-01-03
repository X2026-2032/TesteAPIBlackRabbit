import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";
import { Mail } from "@/utils/mail";

const acceptStatus = z.object({
  feeLimitChangeRequestId: z.string(),
});

export async function denyFeeLimitRequestLimit(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const requestData = acceptStatus.parse(request.body);

    const feeLimitRequest = await prisma.feeLimitChangeRequest.findUnique({
      where: {
        id: requestData.feeLimitChangeRequestId,
      },
      include: {
        GraphicAccount: true,
      },
    });
    if (!feeLimitRequest) {
      reply.status(404).send({ message: "Solicitação não encontrada." });
      return;
    }

    const graphic = feeLimitRequest.GraphicAccount;

    if (graphic) {
      const mailer = new Mail();
      mailer.send({
        body: `Sua solicitação de aumento de limites foi negada. 
        <br/> Detalhes: 
        <br/>Boleto: R$${feeLimitRequest.feeBillet}
        <br/>Interna entrada: R$${feeLimitRequest.feeP2pIn}
        <br/>Interna saída: R$${feeLimitRequest.feeP2pOut}
        <br/>Pix entrada: R$${feeLimitRequest.feePixIn}
        <br/>Pix saída: R$${feeLimitRequest.feePixOut}
        <br/>TED out: R$${feeLimitRequest.feeTedOut}
        <br/>Limite diário: R$${feeLimitRequest.limitDay}
        <br/>Limite noturno: R$${feeLimitRequest.limitNightly}
        <br/>Limite Mensal: R$${feeLimitRequest.limitMonth}
        `,
        email: graphic.email,
        name: graphic.name,
        sender: process.env.MAIL_SENDER as string,
        subject: "Sua solicitação de aumento de limites foi negada.",
      });
    }

    const updatedFeeLimitRequest = await prisma.feeLimitChangeRequest.update({
      where: {
        id: requestData.feeLimitChangeRequestId,
      },
      data: {
        status: "rejected",
      },
    });

    return reply.send(updatedFeeLimitRequest);
  } catch (error: any) {
    throw new AppError(error);
  }
}
