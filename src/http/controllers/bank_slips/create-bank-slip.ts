import { prisma } from "@/lib/prisma";
import { SendSlipToEmail } from "@/use-cases/bank_slips/sendSlipToEmail";
import { AppError } from "@/use-cases/errors/app-error";
import { makeCreateBankSlipUseCase } from "@/use-cases/factories/bank_slips/make-create-bank-slip-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createBankSlip(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      type: z.enum(["BANKSLIP", "BANKSLIP_PIX"]).default("BANKSLIP"),
      dueDate: z.string(),
      amount: z.number().positive().min(10, "Valor mínimo é de R$ 10,00"),
      payer: z.object({
        document: z.string(),
        name: z.string(),
        address: z.object({
          zipCode: z.string(),
          publicPlace: z.string(),
          neighborhood: z.string(),
          number: z.string(),
          complement: z.string(),
          city: z.string(),
          state: z.string(),
        }),
      }),
      recurrence: z.boolean().optional(),
      quantityInstallments: z.number().positive().min(1).max(36).optional(),
    });

    const data = bodySchema.parse(request.body);

    const createBankSlipUseCase = makeCreateBankSlipUseCase();

    const response = await createBankSlipUseCase.execute({
      userId: request?.user?.sub,
      data: request.body,
    });

    const user = await prisma.user.findUnique({
      where: { id: request?.user?.sub },
    });

    if (user)
      SendSlipToEmail.execute({
        bankSlip: response.createdBankSlip as any,
        email: user.email,
      });

    reply.send(response);
  } catch (error: any) {
    throw new AppError(error);
  }
}
