import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { DepositGrapicAccountUseCase } from "@/use-cases/graphic_accounts/deposit-graphic_account";

export async function depositGraphicAccounts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      graphic_account_id: z.string().uuid(),
      amount: z.number().positive().min(0.01),
    });

    const { graphic_account_id, amount } = schema.parse(request.body);

    const deposit = await new DepositGrapicAccountUseCase().execute({
      amount,
      graphic_account_id,
      userId: request.user.sub,
    });

    return reply.status(200).send(deposit);
  } catch (error: any) {
    throw new AppError(error);
  }
}
