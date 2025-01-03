import CreatePersonalAccountUseCase from "@/use-cases/backoffice/accounts/create-personal-account";
import { AppError } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createIndividualAccount(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const data = bodySchema.parse(request.body);

    const user = await CreatePersonalAccountUseCase.execute(data);

    return reply.status(201).send({ ...user, password: undefined });
  } catch (error: any) {
    console.error(error);
    console.error(error.response.data.errors);

    throw new AppError(error);
  }
}

const bodySchema = z.object({
  name: z.string(),
  document: z.string(),
  birthDate: z.string(),
  email: z.string(),
  planId: z.string(),
  phone: z.object({
    number: z.string(),
    ddd: z.string(),
    type: z.string(),
  }),
  address: z.object({
    zipCode: z.string(),
    cityName: z.string(),
    publicPlace: z.string(),
    neighborhood: z.string(),
    state: z.string(),
    number: z.string(),
    complement: z.string(),
    type: z.string(),
  }),
  monthlyInvoicing: z.number().positive(),
  educationLevel: z.string(),
  gender: z.string(),
  password: z.string(),
  pin: z.string(),
  securityEletronic: z.string(),
  maritalStatus: z.string(),
});
