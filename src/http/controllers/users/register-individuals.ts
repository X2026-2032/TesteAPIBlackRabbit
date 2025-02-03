import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { AppError } from "@/use-cases/errors/app-error";
import { makeRegisterUseCase } from "@/use-cases/factories/make-register-use-case";
import { Mail } from "@/utils/mail";

export async function registerIndividuals(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const userId = request.user.sub;

    const schema = z.object({
      userId: z.string().optional(),
      name: z.string(),
      document: z.string(),
      birthDate: z.string(),
      planId: z.string(),
      phone: z.object({
        ddd: z.string(),
        number: z.string(),
        type: z.string(),
      }),
      educationLevel: z.string(),
      maritalStatus: z.string(),
      gender: z.string(),
      monthlyInvoicing: z.number(),
      password: z.string().optional(),
      pin: z.string().length(4).optional(),
      security_eletronic: z.string().length(8),
      address: z.object({
        publicPlace: z.string(),
        number: z.string().optional(),
        neighborhood: z.string(),
        cityName: z.string(),
        state: z.string().length(2),
        zipCode: z.string(),
        complement: z.string().optional(),
        isConfirmed: z.boolean(),
        type: z.string(),
        cityId: z.number().optional(),
      }),
      franchise_id: z.string().optional(),
    });

    const emailSubject = "Pré-cadastro no Nosso Sistema";
    const requestBody = request.body as { email: string; name: string };
    const emailTo = String(requestBody.email);
    const name = String(requestBody.name);
    const emailText = `
  Prezado(a) ${name},

  Agradecemos pelo seu interesse em nossa plataforma. 
  Gostaríamos de informar que estamos analisando cuidadosamente os detalhes do seu pré-cadastro. 
  Em breve, entraremos em contato para fornecer mais informações sobre o andamento do processo.
  Agradecemos pela paciência e antecipamos a oportunidade de tê-lo(a) como parte de nossa comunidade.
  Atenciosamente,
  Ruby-Bank.

  `;

    const data = schema.parse(request.body);

    const registerUseCase = makeRegisterUseCase();
    await registerUseCase.execute(
      {
        ...data,
      },
      userId!,
    );

    const mail = new Mail();

    await mail.send({
      body: emailText,
      email: emailTo,
      name: name,
      sender: emailSubject,
      subject: emailSubject,
    });

    return reply.status(201).send();
  } catch (error) {
    throw new AppError(error as Error);
  }
}

export async function registerIndividualsDocuments(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      documentType: z.string(),
      refId: z.string(),
      id_master_user: z.string(),
      base64: z.string(),
    });

    const data = schema.parse(request.body);

    return reply.status(200).send(data);
  } catch (error) {
    throw new AppError(error as Error);
  }
}

export async function registerIndividualsOccupations(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    return reply.status(200).send("nada aqui pra mostrar antiga accoun idez");
  } catch (error) {
    throw new AppError(error as Error);
  }
}
