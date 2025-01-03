import { AppError } from "@/use-cases/errors/app-error";
import { makeWithdrawGrapicAccountUseCase } from "@/use-cases/factories/graphic_accounts/make-withdraw-graphic_account-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function withdrawGraphicAccounts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      graphic_account_id: z.string().uuid(),
      amount: z.number().positive().min(0.01),
    });

    const { graphic_account_id, amount } = schema.parse(request.body);

    const withdrawGrapicAccountUseCase = makeWithdrawGrapicAccountUseCase();

    const deposit = await withdrawGrapicAccountUseCase.execute({
      userId: request.user.sub,
      graphic_account_id,
      amount,
    });

    return reply.status(200).send(deposit);
  } catch (error: any) {
    console.log(error);

    throw new AppError(error);
  }
}
