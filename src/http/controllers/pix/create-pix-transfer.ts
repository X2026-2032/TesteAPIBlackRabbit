import { prisma } from "@/lib/prisma";
import { makeCreatePixTransferUseCase } from "@/use-cases/factories/make-create-pix-transfer-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createPixTransfers(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const now = new Date();

  // Obter a hora local no fuso horário de Brasília
  const options = { timeZone: "America/Sao_Paulo", hour12: false };
  const localTimeString = now.toLocaleString("en-US", options);
  const localTimeParts = localTimeString.split(", ")[1].split(":");
  const localHours = parseInt(localTimeParts[0], 10);
  const localMinutes = parseInt(localTimeParts[1], 10);

  // Ajustar o objeto de data para o fuso horário de Brasília
  const localTime = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
  );

  const today = new Date(localTime);
  today.setHours(0, 0, 0, 0);

  const todayNightStart = new Date(localTime);
  todayNightStart.setHours(19, 0, 0, 0);

  const todayNightEnd = new Date(localTime);
  todayNightEnd.setDate(todayNightEnd.getDate() + 1);
  todayNightEnd.setHours(6, 0, 0, 0);

  const firstDayOfMonth = new Date(
    localTime.getFullYear(),
    localTime.getMonth(),
    1,
  );
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const lastDayOfMonth = new Date(
    localTime.getFullYear(),
    localTime.getMonth() + 1,
    0,
  );
  lastDayOfMonth.setHours(23, 59, 59, 999);

  const currentHour = localHours;

  const isNightlyPeriod = currentHour >= 18 || currentHour < 6;

  try {
    const schema = z.object({
      amount: z.number().positive().min(0.01),
      description: z.string().optional().default("Sem descrição"),
      endToEndId: z.string(),
      initiationType: z.string(),
      transactionId: z.string().optional(),
    });

    const data = schema.parse(request.body);

    const graphicAccounts = await prisma.graphicAccount.findFirst({
      where: {
        id: request.user.sub,
        role: "WALLET",
      },
    });

    if (!graphicAccounts) {
      const createPixTransferUseCase = makeCreatePixTransferUseCase();
      const pix = await createPixTransferUseCase.execute({
        ...data,
        userId: request.user.sub,
      });
      return reply.status(200).send(pix);
    }
    const createPixTransferUseCase = makeCreatePixTransferUseCase();
    const pix = await createPixTransferUseCase.execute({
      ...data,
      userId: request.user.sub,
    });
    return reply.status(200).send(pix);
  } catch (error: any) {
    return reply.status(400).send({ message: error.message });
  }
}
