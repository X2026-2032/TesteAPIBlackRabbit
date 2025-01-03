import { CreateBankTransferWithPixUseCase } from "@/use-cases/create-bank-transfer-with-pix";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createBankTransfersWithPix(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      amount: z.number().positive(),
      description: z.string().optional(),
      beneficiary: z.object({
        holder: z.object({
          name: z.string(),
          document: z.string(),
          type: z.enum(["NATURAL", "LEGAL"]).default("NATURAL"),
        }),
        participantIspb: z.string(),
        number: z.string(),
        branch: z.string(),
        type: z
          .enum(["CURRENT", "PAYMENT", "SAVING", "SALARY"])
          .default("CURRENT"),
      }),
      scheduled: z.boolean().default(false),
      scheduleDate: z.string().optional(),
    });

    const { amount, beneficiary, description, scheduled, scheduleDate } =
      schema.parse(request.body);

    const bankTransferWithPixUseCase = new CreateBankTransferWithPixUseCase();

    const transfers = await bankTransferWithPixUseCase.execute({
      userId: request.user.sub,
      data: {
        amount,
        description,
        beneficiary,
        scheduled,
        scheduleDate,
      },
    });

    return reply.status(200).send(transfers);
  } catch (error: any) {
    throw new AppError(error);
  }
}
