import { CreateCompaineAccountUseCase } from "@/use-cases/backoffice/accounts/create-compaine-account";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createCompaineAccount(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      document: z.string(),
      mother_name: z.string(),
      phone: z.object({
        ddd: z.string(),
        number: z.string(),
        type: z.string(),
      }),
      // businessEmail: z.string().email(),
      password: z.string(),
      email: z.string(),
      security_eletronic: z.string().length(8),
      corporateName: z.string(),
      fantasyName: z.string(),
      activityCnae: z.string(),
      openingDate: z.string(),
      constituitionType: z.string(),
      isPoliticallyExposedPerson: z.boolean(),
      amountMonthlyInvoicing: z.number(),
      amountShareCapital: z.number(),
      amountPatrimony: z.number(),
      planId: z.string().optional(),
      address: z.object({
        state: z.string().length(2),
        cityName: z.string(),
        isConfirmed: z.boolean(),
        type: z.string(),
        publicPlace: z.string(),
        number: z.string(),
        zipCode: z.string(),
        neighborhood: z.string(),
        complement: z.string(),
      }),
      partners: z.array(
        z.object({
          document: z.string(),
          name: z.string(),
          mother_name: z.string(),
          birthDate: z.string(),
          // email: z.string().email(),
          phone: z.object({
            ddd: z.string(),
            number: z.string(),
          }),
          address: z.object({
            isConfirmed: z.boolean(),
            type: z.string(),
            neighborhood: z.string(),
            complement: z.string(),
            cityName: z.string(),
            number: z.string(),
            zipCode: z.string(),
            publicPlace: z.string(),
            state: z.string().length(2),
          }),
        }),
      ),
    });

    const data = schema.parse(request.body);

    const user = await CreateCompaineAccountUseCase.execute(data);
    return reply.status(201).send({ ...user, password: undefined });
  } catch (error: any) {
    console.log(error);

    throw new AppError(error);
  }
}
