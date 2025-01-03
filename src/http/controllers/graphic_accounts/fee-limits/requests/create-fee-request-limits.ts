import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";
import { Mail } from "@/utils/mail";

const feeLimitChangeRequestSchema = z.object({
  feePixIn: z.number(),
  feePixOut: z.number(),
  feeTedOut: z.number(),
  feeP2pOut: z.number(),
  feeBillet: z.number(),
  limitDay: z.number(),
  limitNightly: z.number(),
  limitMonth: z.number(),
  status: z.string(),
});

export async function createFeeLimitRequestLimit(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    const userId = request?.user?.sub;
    const requestData = feeLimitChangeRequestSchema.parse(request.body);

    const existingRequest = await prisma.feeLimitChangeRequest.findFirst({
      where: {
        graphicAccountId: userId,
        status: "waiting",
      },
    });

    if (existingRequest) {
      throw new Error("Já existe uma solicitação pendente para este usuário.");
    }

    const newFeeLimitChangeRequest = await prisma.feeLimitChangeRequest.create({
      data: {
        graphicAccountId: userId,
        feePixIn: requestData.feePixIn,
        feePixOut: requestData.feePixOut,
        feeTedOut: requestData.feeTedOut,
        feeP2pOut: requestData.feeP2pOut,
        feeBillet: requestData.feeBillet,
        limitDay: requestData.limitDay,
        limitNightly: requestData.limitNightly,
        limitMonth: requestData.limitMonth,
        status: requestData.status,
      },
      include: {
        GraphicAccount: true,
      },
    });

    const graphic = newFeeLimitChangeRequest.GraphicAccount;

    if (graphic) {
      const mailer = new Mail();
      mailer.send({
        body: `Uma solicitação de aumento de limites foi criada.
        <br/> Detalhes:
        <br/>Boleto: R$${newFeeLimitChangeRequest.feeBillet}
        <br/>Interna entrada: R$${newFeeLimitChangeRequest.feeP2pIn}
        <br/>Interna saída: R$${newFeeLimitChangeRequest.feeP2pOut}
        <br/>Pix entrada: R$${newFeeLimitChangeRequest.feePixIn}
        <br/>Pix saída: R$${newFeeLimitChangeRequest.feePixOut}
        <br/>TED out: R$${newFeeLimitChangeRequest.feeTedOut}
        <br/>Limite diário: R$${newFeeLimitChangeRequest.limitDay}
        <br/>Limite noturno: R$${newFeeLimitChangeRequest.limitNightly}
        <br/>Limite Mensal: R$${newFeeLimitChangeRequest.limitMonth}
        `,
        email: graphic.email!,
        name: graphic.name,
        sender: process.env.MAIL_SENDER as string,
        subject: "Sua solicitação de aumento de limites foi aceita.",
      });
    }

    return reply.send(newFeeLimitChangeRequest);
  } catch (error: any) {
    throw new AppError(error);
  }
}
