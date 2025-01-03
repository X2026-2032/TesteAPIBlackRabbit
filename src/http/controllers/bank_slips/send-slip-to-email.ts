import { prisma } from "@/lib/prisma";
import { SendSlipToEmail } from "@/use-cases/bank_slips/sendSlipToEmail";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function sendSlipToEmail(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const bodySchema = z.object({
      slipId: z.string(),
      email: z.string().email("Email invalido"),
    });

    const data = bodySchema.parse(request.body);

    const slip = await prisma.bankSlip.findFirst({
      where: { id: data.slipId },
    });

    if (!slip) return reply.status(404).send({ message: "Slip not found" });

    SendSlipToEmail.execute({ bankSlip: slip, email: data.email });
    reply.send();
  } catch (error: any) {
    throw new AppError(error);
  }
}
