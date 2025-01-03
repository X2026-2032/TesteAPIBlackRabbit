import { prisma } from "@/lib/prisma";
import { IdezBankTransfersService } from "@/service/idez/bank-transfers";
import { CreateP2pTaxTransferUseCase } from "@/use-cases/create-p2p-transfer-tax";
import { AppError } from "@/use-cases/errors/app-error";
import { makeCreateP2pTransferUseCase } from "@/use-cases/factories/make-create-p2p-transfer-use-case";
import { getMaxNumberOfTransactionByAccountTransactions } from "@/utils";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createManualTax(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      payerId: z.string(),
      amount: z.number().positive(),
      description: z.string().optional(),
    });

    const beneficiaryId = request.user.sub;

    const { amount, payerId, description } = schema.parse(request.body);

    const beneficiaryUser = await prisma.user.findFirst({
      where: { id: beneficiaryId },
    });

    if (!beneficiaryUser || beneficiaryUser.role != "MASTER")
      throw new AppError({ message: "Not authorized", status: 401 });

    const payer = await prisma.account.findFirst({ where: { id: payerId } });

    const beneficiary = await prisma.account.findFirst({
      where: { user_id: beneficiaryUser.id },
    });

    if (!payer) {
      throw new AppError({ message: "payer not found", status: 404 });
    }

    if (!beneficiary) {
      throw new AppError({ message: "beneficiary not found", status: 404 });
    }

    let account5Digits;

    //valida a existencia de account_number e account_digit pra nao gerar erro
    if (beneficiary.account_number && beneficiary.account_digit) {
      account5Digits = `${beneficiary.account_number}${beneficiary.account_digit}`;
    }

    if (!account5Digits)
      throw new AppError({
        message: "5 digits account number is required for p2p transfer",
      });
    if (!beneficiary.api_key)
      throw new AppError({
        message: "account.api_key is required for this action",
      });

    const response = await new IdezBankTransfersService().p2pTransfer(
      { amount, beneficiaryAccount: account5Digits, description },
      payer.api_key!,
    );
    const number_of_transaction =
      await getMaxNumberOfTransactionByAccountTransactions();
    await prisma.$transaction(async (tx) => {
      const payerTransaction = await tx.accountTransaction.create({
        data: {
          amount: amount,
          data: response,
          description,
          response,
          direction: "out",
          type: "P2P_TAX",
          account_id: payer.id,
          number_of_transaction,
        },
      });

      const beneficiaryTransaction = await tx.accountTransaction.create({
        data: {
          amount: amount,
          data: response,
          description,
          response,
          direction: "in",
          type: "P2P_TAX",
          account_id: beneficiary.id,
          number_of_transaction,
        },
      });
      return reply.status(200).send({});
    });
  } catch (error: any) {
    throw new AppError(error);
  }
}
