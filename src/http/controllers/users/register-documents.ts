// import { FastifyReply, FastifyRequest } from "fastify";
// import { z } from "zod";
// import { MultipartFile } from "@fastify/multipart";
// import { makeRegisterDocumentsUseCase } from "@/use-cases/factories/make-register-documents-use-case";
// import { sendEmail } from "./send-email";
// import { AppError } from "@/use-cases/errors/app-error";
// import { makeRegisterIndividualsDocumentst } from "@/use-cases/factories/make-register-individuals";

// export async function registerDocuments(
//   request: FastifyRequest,
//   reply: FastifyReply,
// ) {
//   try {
//     const schema = z.object({
//       documentType: z.string(),
//       base64: z.string(),
//       id_master_user: z.string(),
//       activeMasterUser: z.boolean().optional(),
//     });

//     const data = schema.parse(request.body);

//     const usecase = makeRegisterIndividualsDocumentst();

//     const response = await usecase.execute(data, request.user.sub);

//     return reply.status(200).send(response);
//     //   const options = [
//     //     "SELFIE",
//     //     "IDENTITY_CARD_FRONT",
//     //     "IDENTITY_CARD_VERSE",
//     //     "DRIVER_LICENSE_FRONT",
//     //     "DRIVER_LICENSE_VERSE",
//     //     "PASSPORT",
//     //     "SOCIAL_CONTRACT",
//     //     "DIGITAL_DRIVER_LICENSE",
//     //     "EXTRAORDINARY_DOCUMENTS_FRONT",
//     //     "EXTRAORDINARY_DOCUMENTS_VERSE",
//     //     "ARTICLES_OF_ASSOCIATION",
//     //     "CCMEI",
//     //     "COMPANY_BYLAWS",
//     //     "EI_REGISTRATION_REQUIREMENT",
//     //     "LEGAL_STATEMENT",
//     //     "REVENUES_RECEIPT",
//     //     "SELFIE",
//     //     "RG_FRONT",
//     //     "RG_BACK",
//     //     "RG_FULL",
//     //     "CNH_FRONT",
//     //     "CNH_BACK",
//     //     "CNH_FULL",
//     //     "PERSON_LEGAL_LATEST_CHANGES",
//     //     "PERSON_LEGAL_SOCIAL_CONTRACT",
//     //     "PERSON_LEGAL_REVENUES",
//     //   ] as const;

//     //   const schema = z.object({
//     //     type: z.enum(options),
//     //   });

//     //   const { type } = schema.parse(request.query);
//     //   const data = (await request.file()) as MultipartFile;

//     // const registerDocumentsUseCase = makeRegisterDocumentsUseCase();
//     // const document = await registerDocumentsUseCase.execute({
//     //   userId: request.user.sub,
//     //   file: data,
//     //   type,
//     // });

//     //   const emailSubject = "Pré-cadastro no Nosso Sistema";
//     //   const emailTo = document!.email;
//     //   const name = document!.name;
//     //   const emailText = `
//     //   Prezado(a) ${name},

//     //   Parabéns! Sua aprovação foi confirmada.
//     //   Bem-vindo à Digital-Bank! Estamos ansiosos para começar essa jornada junto com você. Qualquer dúvida, estamos à disposição'
//     // `;

//     //   await sendEmail(emailSubject, emailText, emailTo);
//     //   return reply.status(201).send(document);
//   } catch (error) {
//     console.log(error);

//     throw new AppError(error as Error);
//   }
// }
