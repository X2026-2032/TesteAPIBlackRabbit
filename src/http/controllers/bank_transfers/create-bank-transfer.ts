import { AppError } from "@/use-cases/errors/app-error";
import { makeCreateBankTransferCase } from "@/use-cases/factories/make-create-bank-transfer-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createBankTransfers(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      pin: z.string().length(4),
      amount: z.number().positive(),
      bank_account: z.object({
        name: z.string(),
        document: z.string(),
        bank: z.string(), //ispb
        branch: z.string().length(4),
        type: z.string().default("CURRENT"),
        account_number: z.string(),
        account_digit: z.string().length(1),
      }),
    });

    const { pin, amount, bank_account } = schema.parse(request.body);

    const createBankTransferCase = makeCreateBankTransferCase();

    const transfers = await createBankTransferCase.execute({
      userId: request.user.sub,
      data: {
        pin,
        amount,
        bank_account,
      },
    });

    return reply.status(200).send(transfers);
  } catch (error) {
    throw new AppError(error);
  }
}
