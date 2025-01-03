import { AppError } from "@/use-cases/errors/app-error";
import { makeCreateGrapicAccountUseCase } from "@/use-cases/factories/graphic_accounts/make-create-graphic_accounts-use-case";
import { generateUniqueIdentifier } from "@/use-cases/graphic_accounts/create-graphic_accounts";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function createGraphicAccounts(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      document: z.string(),
      rg_cnh: z.string().optional(),
      email: z.string().optional(),
      name: z.string().optional(),
      password: z.string(),
      type: z.string(),
      isPoliticallyExposedPerson: z.boolean().optional(),
      amountMonthlyInvoicing: z.number().optional(),
      amountShareCapital: z.number().optional(),
      corporateName: z.string().optional(),
      fantasyName: z.string().optional(),
      amountPatrimony: z.number().optional(),
      activityCnae: z.string().optional(),
      openingDate: z.string().optional(),
      passwordEletronic: z.string().length(8),
      blocked: z.boolean().default(false),
      counter: z.number().default(0),
      monthlyInvoicing: z.string().optional(),
      educationLevel: z.string().optional(),
      maritalStatus: z.string().optional(),
      isRole: z.string(),
      gender: z.string().optional(),
      birthDate: z.string().optional(),
      isUser: z.string().optional(),
      planId: z.string().optional(),
      pin: z.string(),
      phone: z
        .object({
          number: z.string(),
          type: z.string(),
          ddd: z.string(),
        })
        .optional(),
      address: z
        .object({
          state: z.string(),
          publicPlace: z.string(),
          number: z.string(),
          zipCode: z.string(),
          neighborhood: z.string(),
          complement: z.string().optional(),
          isConfirmed: z.boolean(),
          type: z.string(),
          cityId: z.number().optional(),
          cityName: z.string().optional(),
        })
        .optional(),
      partners: z
        .object({
          is_pep: z.boolean().optional(),
          name: z.string().optional(),
          document: z.string().optional(),
          birthDate: z.string().optional(),
          mother_name: z.string().optional(),
          phone: z.object({
            number: z.string(),
            type: z.string(),
            ddd: z.string(),
          }),
          address: z.object({
            state: z.string(),
            publicPlace: z.string(),
            number: z.string(),
            zipCode: z.string(),
            neighborhood: z.string(),
            complement: z.string().optional(),
            isConfirmed: z.boolean(),
            type: z.string(),
            cityId: z.number().optional(),
            cityName: z.string().optional(),
          }),
        })
        .optional(),
    });

    const {
      document,
      email,
      name,
      password,
      passwordEletronic,
      blocked,
      counter,
      isRole,
      gender,
      birthDate,
      isUser,
      rg_cnh,
      address,
      planId,
      pin,
      phone,
      educationLevel,
      maritalStatus,
      monthlyInvoicing,
      activityCnae,
      amountMonthlyInvoicing,
      amountPatrimony,
      amountShareCapital,
      corporateName,
      fantasyName,
      isPoliticallyExposedPerson,
      openingDate,
      partners,
      type,
    } = schema.parse(request.body);

    const createGrapicAccountUseCase = makeCreateGrapicAccountUseCase();

    const userIdCompare =
      isRole === "WALLET" ? process.env.ADMIN_BAG_ID : isUser;

    const account = await createGrapicAccountUseCase.execute({
      userId: userIdCompare,
      document,
      email,
      name: type === "PF" ? name! : partners!.name!,
      password,
      pin,
      phone,
      number_identifier: generateUniqueIdentifier(),
      passwordEletronic,
      blocked,
      counter,
      role: isRole,
      gender,
      birthDate,
      rg_cnh: type === "PF" ? rg_cnh : partners!.document!,
      address,
      planId,
      educationLevel,
      maritalStatus,
      monthlyInvoicing,
      amountMonthlyInvoicing,
      isPoliticallyExposedPerson,
      type,
      activityCnae,
      openingDate,
      amountPatrimony,
      amountShareCapital,
      corporateName,
      fantasyName,
      partners,
    });

    return reply.status(200).send(account);
  } catch (error: any) {
    throw new AppError(error);
  }
}
