import { AppError } from "@/use-cases/errors/app-error";
import { makeDeniedGrapicAccountTransactions } from "@/use-cases/factories/graphic_accounts/make-denied-graphic-accounts-transactions";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function deniedGrapicAccountTransactions(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      data: z.string().uuid().array(),
      graphic_account_id: z.string().uuid(),
    });

    const data = schema.parse(request.body);
    const factory = makeDeniedGrapicAccountTransactions();

    const userId = request.user.sub;
    await factory.execute(userId, data);

    reply.status(200);
  } catch (error) {
    throw new AppError(error);
  }
}
