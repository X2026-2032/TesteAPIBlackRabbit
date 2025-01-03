import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";
import { Mail } from "@/utils/mail";

const acceptStatus = z.object({
  feeLimitChangeRequestId: z.string(),
  graphicAccountId: z.string(),
});

export async function acceptFeeLimitRequestLimit(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const requestData = acceptStatus.parse(request.body);

    const feeLimitRequest = await prisma.feeLimitChangeRequest.findUnique({
      where: {
        id: requestData.feeLimitChangeRequestId,
      },
    });

    if (!feeLimitRequest) {
      reply.status(404).send({ message: "Solicitação não encontrada." });
      return;
    }

    const updatedFeeLimitRequest = await prisma.feeLimitChangeRequest.update({
      where: {
        id: requestData.feeLimitChangeRequestId,
      },
      data: {
        status: "approved",
      },
    });

    // Verifica se os registros GraphicAccount existem
    const graphicAccount = await prisma.graphicAccount.findUnique({
      where: {
        id: requestData.graphicAccountId,
      },
    });

    if (!graphicAccount) {
      // Se GraphicAccount não existir, trate conforme necessário
      reply.status(404).send({ message: "Conta gráfica não encontrada." });
      return;
    }

    // Verifica se existem limites de taxa para a conta gráfica
    let feeLimits = await prisma.feeLimits.findFirst({
      where: {
        graphic_account_id: requestData.graphicAccountId,
      },
    });

    if (!feeLimits) {
      // Se não houver limites de taxa, crie-os
      feeLimits = await prisma.feeLimits.create({
        data: {
          graphic_account_id: requestData.graphicAccountId,
          feePixIn: feeLimitRequest.feePixIn,
          feePixOut: feeLimitRequest.feePixOut,
          feeTedOut: feeLimitRequest.feeTedOut,
          feeP2pIn: feeLimitRequest.feeP2pIn,
          feeP2pOut: feeLimitRequest.feeP2pOut,
          feeBillet: feeLimitRequest.feeBillet,
          limitDay: feeLimitRequest.limitDay,
          limitNightly: feeLimitRequest.limitNightly,
          limitMonth: feeLimitRequest.limitMonth,
        },
      });
    } else {
      // Se houver limites de taxa, atualize-os
      await prisma.feeLimits.update({
        where: {
          graphic_account_id: requestData.graphicAccountId,
        },
        data: {
          feePixIn: feeLimitRequest.feePixIn,
          feePixOut: feeLimitRequest.feePixOut,
          feeTedOut: feeLimitRequest.feeTedOut,
          feeP2pIn: feeLimitRequest.feeP2pIn,
          feeP2pOut: feeLimitRequest.feeP2pOut,
          feeBillet: feeLimitRequest.feeBillet,
          limitDay: feeLimitRequest.limitDay,
          limitNightly: feeLimitRequest.limitNightly,
          limitMonth: feeLimitRequest.limitMonth,
        },
      });
    }

    const mailer = new Mail();
    mailer.send({
      body: `Sua solicitação de aumento de limites foi aceita.
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
      email: graphicAccount.email!,
      name: graphicAccount.name,
      sender: process.env.MAIL_SENDER as string,
      subject: "Sua solicitação de aumento de limites foi aceita.",
    });

    // Envie a resposta com os limites de taxa atualizados
    reply.send(updatedFeeLimitRequest);
  } catch (error: any) {
    throw new AppError(error);
  }
}
