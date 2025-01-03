import { AppError } from "@/use-cases/errors/app-error";
import { makeApprovedTaxAutomaticGrapicAccountTransactions } from "@/use-cases/factories/graphic_accounts/make-approved-graphic-accounts-transactions-tax-automatic";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function approvedTaxAutomaticGrapicAccountTransactions(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const schema = z.object({
      pin: z.string().length(4),
      data: z.string().uuid().array(),
      graphic_account: z.boolean().default(false),
      graphic_account_id: z.string().uuid().optional(),
    });

    const data = schema.parse(request.body);
    const factory = makeApprovedTaxAutomaticGrapicAccountTransactions();

    const userId = request.user.sub;
    await factory.execute(userId, data);

    reply.status(200);
  } catch (error) {
    throw new AppError(error);
  }
} 
