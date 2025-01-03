import { AppError } from "@/use-cases/errors/app-error";
import { RegisterCompaniesUseCase } from "@/use-cases/register-companie";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function registerCompanies(
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
      security_eletronic: z.string().length(8),
      corporateName: z.string(),
      fantasyName: z.string(),
      activityCnae: z.string(),
      constituitionType: z.string(),
      openingDate: z.string(),
      isPoliticallyExposedPerson: z.boolean(),
      amountMonthlyInvoicing: z.number(),
      amountShareCapital: z.number(),
      amountPatrimony: z.number(),
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

    const registerCompanieUseCase = new RegisterCompaniesUseCase();

    await registerCompanieUseCase.execute({
      ...data,
      walletId: request.user.sub,
    });
    return reply.status(201).send();
  } catch (error: any) {
    console.error(error);

    throw new AppError(error);
  }
}
