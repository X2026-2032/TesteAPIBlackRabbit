import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AppError } from "@/use-cases/errors/app-error";
import { VerifyTaxUseCase } from "@/use-cases/tax/verifyTax";

export async function verifyTax(request: FastifyRequest, reply: FastifyReply) {
  try {
    const schema = z.object({
      account_id: z.string().uuid(),
      transactionAmmount: z.number(),
      taxType: z.string(),
    });

    const data = schema.parse(request.body);

    const calculatedTax = await VerifyTaxUseCase.execute(data);

    return reply.status(200).send({ calculatedTax });
  } catch (error: any) {
    throw new AppError(error);
  }
}
