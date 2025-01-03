import { AppError } from "@/use-cases/errors/app-error";
import { makeApprovedGrapicAccountTransactions } from "@/use-cases/factories/graphic_accounts/make-approved-graphic-accounts-transactions";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function approvedGrapicAccountTransactions(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      data: z.string().uuid().array(),
      graphic_account_id: z.string().uuid().optional(),
    });

    const data = schema.parse(request.body);
    const factory = makeApprovedGrapicAccountTransactions();

    const userId = request.user.sub;
    await factory.execute(userId, data);

    reply.status(200);
  } catch (error) {
    throw new AppError(error);
  }
}
