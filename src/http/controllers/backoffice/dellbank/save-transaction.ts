import { prisma } from "@/lib/prisma";
import { AppError } from "@/use-cases/errors/app-error";
import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { getMaxNumberOfTransactionByAccountTransactions } from "@/utils";

export async function saveTransaction(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      id: z.string(),
      nsu: z.number(),
      amount: z.number(),
      createdAt: z.string(),
      type: z.object({
        name: z.string(),
        description: z.string(),
        isCredit: z.boolean(),
      }),
      balance: z.object({
        balancePrevious: z.number(),
        currentBalance: z.number(),
      }),
      proof: z.object({
        id: z.string(),
        externalId: z.string(),
        status: z.string(),
        type: z.string(),
        amount: z.number(),
        createdAt: z.string(),
        payer: z.object({
          number: z.string(),
          branch: z.string(),
          type: z.string(),
          holder: z.object({
            document: z.string(),
            name: z.string(),
            type: z.string(),
          }),
          participant: z.object({
            name: z.string(),
            ispb: z.string(),
          }),
        }),
        beneficiary: z.object({
          number: z.string(),
          branch: z.string(),
          type: z.string(),
          holder: z.object({
            document: z.string(),
            name: z.string(),
            type: z.string(),
          }),
          participant: z.object({
            name: z.string(),
            ispb: z.string(),
          }),
        }),
      }),
    });

    const data = bodySchema.parse(request.body);

    const direction: "IN" | "OUT" =
      data.balance.currentBalance > data.balance.balancePrevious ? "IN" : "OUT";

    const beneficiary = await prisma.user.findFirst({
      where: {
        document: data.proof.beneficiary.holder.document,
      },
      include: {
        Account: true,
      },
    });

    if (!beneficiary)
      return reply.status(200).send({ message: "Beneficiary not found" });

    const checkedTransaction = await prisma.accountTransaction.findFirst({
      where: {
        id: data.id,
      },
    });

    if (checkedTransaction)
      return reply.status(200).send({ message: "A transação já existe!" });

    await prisma.$transaction(async (tx) => {
      const number_of_transaction =
        await getMaxNumberOfTransactionByAccountTransactions();

      await tx.accountTransaction.create({
        data: {
          id: data.id,
          account_id: beneficiary.Account[0].id,
          amount: data.amount,
          previousValue: data.balance.balancePrevious || 0,
          created_at: data.createdAt,
          data: {
            payer: data.proof.payer.holder.name,
            beneficiary: data.proof.beneficiary.holder.name,
          } as any,
          status: data.proof.status,
          direction: direction,
          type: data.proof.type,
          description: data.type.description,
          number_of_transaction,
        },
      });

      return reply.status(200).send({
        message: "Transação salva com sucesso!",
      });
    });
  } catch (error: any) {
    throw new AppError(error);
  }
}
