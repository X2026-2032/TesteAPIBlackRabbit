import { BankSlipRequest } from "@/repositories/bank-slip-repository";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AppError } from "@/use-cases/errors/app-error";
import { prisma } from "@/lib/prisma";

export async function getAllBankSlipsController(
  request: FastifyRequest<BankSlipRequest>,
  reply: FastifyReply,
) {
  try {
    const querySchema = z.object({
      page: z.string().optional().default("1"),
      per_page: z.string().optional().default("20"),
      status: z.enum(["waiting", "paid"]).optional(),
    });

    const queryParams = querySchema.parse(request.query);

    const userId = request?.user?.sub;

    const skip =
      (parseInt(queryParams.page) - 1) * parseInt(queryParams.per_page);
    const take = parseInt(queryParams.per_page);

    const bankSlips = await prisma.bankSlip.findMany({
      where: { reference_id: userId },
      skip: skip == 0 ? undefined : skip,
      take,
    });

    // const getAllBankSlipsUseCase = new GetAllBankSlipsUseCase(bankSlipRepository);
    // const bankSlips = await getAllBankSlipsUseCase.execute(userId, queryParams);
    return reply.send(bankSlips);
  } catch (error: any) {
    throw new AppError(error);
  }
}
