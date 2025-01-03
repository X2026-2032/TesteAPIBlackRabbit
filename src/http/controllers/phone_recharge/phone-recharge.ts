import { AppError } from "@/use-cases/errors/app-error";
import { makePhoneRechargeUseCase } from "@/use-cases/factories/phone_recharge/make-phone-recharge-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

const phoneRechargeUseCase = makePhoneRechargeUseCase();

export async function phoneRecharge(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      dealer_code: z.string().length(3),
      area_code: z.string().length(2),
      phone_number: z.string(),
    });

    const data = schema.parse(request.body);

    const response = await phoneRechargeUseCase.execute({
      data,
      userId: request?.user?.sub,
    });
    return reply.status(200).send(response);
  } catch (error) {
    throw new AppError(error);
  }
}
