import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";

export async function getInOut(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.user.sub;

    const user = await prisma.user.findFirst({ where: { id: userId } });
    const graphic = await prisma.graphicAccount.findFirst({
      where: { id: userId },
    });

    const data = {
      in: 0,
      out: 0,
    };

    if (!user && !graphic)
      throw new AppError({ message: "User not found", status: 404 });

    if (user) {
      const account = await prisma.account.findFirst({
        where: { user_id: user.id, refId: user.refId! },
      });

      if (!account)
        throw new AppError({ message: "User account not found", status: 404 });

      const transactions = await prisma.accountTransaction.findMany({
        where: { account_id: account.id, status: "done" },
        select: { amount: true, direction: true },
      });

      transactions.forEach((t) => {
        if (t.direction == "in") data.in += t.amount;
        if (t.direction == "out") data.out += t.amount;
      });

      return reply.send(data);
    }

    if (graphic) {
      const transactions = await prisma.graphicAccountTransaction.findMany({
        where: { graphic_account_id: graphic.id, status: "done" },
        select: { amount: true, direction: true },
      });

      transactions.forEach((t) => {
        if (t.direction == "in") data.in += t.amount;
        if (t.direction == "out") data.out += t.amount;
      });

      return reply.send(data);
    }
  } catch (error) {
    reply
      .status(500)
      .send("Erro ao obter a configuração da chave PIX do usuário");
  }
}
