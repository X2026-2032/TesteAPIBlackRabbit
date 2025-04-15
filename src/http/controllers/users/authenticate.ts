//

import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAuthenticateUseCase } from "@/use-cases/factories/make-authenticate-use-case";
import { AppError, IRequest } from "@/use-cases/errors/app-error";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      userName: z.string(),
      password_hash: z.string().min(4),
    });

    const { userName, password_hash } = schema.parse(request.body);

    const authenticateUseCase = makeAuthenticateUseCase();
    const { graphicUser: user } = await authenticateUseCase.execute({
      userName,
      password_hash,
    });

    if (!user) {
      return reply
        .status(401)
        .send({ message: "Usuário ou senha incorretos." });
    }

    const token = await reply.jwtSign(
      { role: user.role },
      { sign: { sub: user.id, expiresIn: "7d" } },
    );

    return reply.status(200).send({
      user: { id: user.id, role: user.role, userName: user.userName },
      token,
    });
  } catch (error) {
    console.error(error);

    throw new AppError(error as unknown as IRequest);
  }
}

// import { AppError, IRequest } from "@/use-cases/errors/app-error";
// import { makeAuthenticateUseCase } from "@/use-cases/factories/make-authenticate-use-case";
// import { FastifyReply, FastifyRequest } from "fastify";
// import { z } from "zod";
// import { prisma } from "@/lib/prisma";
// import { VeriffSuccessType } from "@/@types/types";
// import { EmailInterface, Mail } from "@/utils/mail";
// import fs from "fs";
// import handlebars from "handlebars";

// export async function authenticate(
//   request: FastifyRequest,
//   reply: FastifyReply,
// ) {
//   try {
//     const schema = z.object({
//       userName: z.string(),
//       password_hash: z.string().min(8),
//     });

//     const { password_hash, userName } = schema.parse(request.body);

//     const authenticateUseCase = makeAuthenticateUseCase();

//     const { user, account }: any = await authenticateUseCase.execute({
//       userName,
//       password_hash,
//     });

//     const token = await reply.jwtSign(
//       { role: user.role, type: user.type },
//       { sign: { sub: user.id, expiresIn: "7d" } },
//     );

//     const userRole = user.role;
//     const userAccount =
//          await getWalletGraphicAccount(request, reply);

//     const isGraphicAccountMember = await prisma.graphicAccount.findFirst({
//       where: {
//         id: user.id,},
//       include: {
//        groupMembers: true,
//        receivedMessages: true,
//        sentMessages: true,
//       },
//     });

//     // const address = await prisma.address.findFirst({
//     //   where: {
//     //     graphicId: user.id,
//     //   },
//     // });

//     const data = {
//       user: {
//         ...user,
//         address,
//         access_token: undefined,
//         idMasterUser: isGraphicAccountMember ? true : false,
//       },
//       account: userAccount || account,
//       token,
//       // balance: balanceResponseData.amountAvailable,
//     };

//     return reply.status(200).send(data);
//   } catch (error) {
//     console.log(error);

//     throw new AppError(error as unknown as IRequest);
//   }
// }

// // export async function getMemberAdminAccount(userId: string, refId: string) {
// //   try {
// //     const account = await prisma.account.findFirst({
// //       where: {
// //         user_id: userId,
// //         refId,
// //       },
// //     });

// //     if (!account) {
// //       throw new AppError({ message: "Account not found for the user" });
// //     }

// //     return account;
// //   } catch (err: any) {
// //     console.error(err);

// //     throw new Error(err);
// //   }
// // }

// export async function getWalletGraphicAccount(
//   request: FastifyRequest,
//   reply: FastifyReply,
// ) {
//   try {
//     const schema = z.object({
//       userName: z.string(),
//       password: z.string().min(6),
//     });

//     const { userName, password } = schema.parse(request.body);

//     const authenticateUseCase = makeAuthenticateUseCase();

//     const { graphicUser: user } = await authenticateUseCase.execute({
//       userName,
//       password_hash,
//     });

//     const token = await reply.jwtSign(
//       { role: user.role },
//       { sign: { sub: user.id, expiresIn: "7d" } },
//     );

//     // const address = await prisma.address.findFirst({
//     //   where: {
//     //     graphicId: user.id,
//     //   },
//     // });

//     return reply.status(200).send({
//       userName: { ...user, access_token: undefined },
//       token,
//     });
//   } catch (error) {
//     throw new AppError(error as unknown as IRequest);
//   }
// }

// // export async function completeUserVeriff(
// //   request: FastifyRequest,
// //   reply: FastifyReply,
// // ) {
// //   try {
// //     const data = request.body as VeriffSuccessType;

// //     const status = data?.status || null;

// //     const mail = new Mail();

// //     console.log("VERIFF:", data);

// //     const templateAproovedFile = fs.readFileSync(
// //       "templates/veriff-aprooved.hbs",
// //       "utf8",
// //     );
// //     const templateDeclinedFile = fs.readFileSync(
// //       "templates/veriff-declined.hbs",
// //       "utf8",
// //     );
// //     const templateAprooved = handlebars.compile(templateAproovedFile);
// //     const templateDeclined = handlebars.compile(templateDeclinedFile);

//     // if (status) {
//     //   const document = data.verification.document.number;
//     //   const documentWithoutDot = document
//     //     .replace(".", "")
//     //     .replace(".", "")
//     //     .replace(".", "")
//     //     .replace("-", "")
//     //     .replace("-", "");
//       // tentar colocar um replaceAll (alterar a versao do node.js)

//       // const account = await prisma.graphicAccount.findFirst({
//       //   where: { rg_cnh: documentWithoutDot },
//       // });

//       // const verification = data.verification.status;
//       // if (account) {
//       //   await prisma.graphicAccount.update({
//       //     where: { id: account.id },
//       //     data: {
//       //       status: verification == "approved" ? "active" : verification,
//       //     },
//       //   });
//       // }

//       // if (account) {
//       //   let body = "";

//       //   if (verification == "approved") {
//       //     body = templateAprooved({
//       //       name: account.name.split(" ")[0],
//       //       image: process.env.VERIFF_EMAIL_IMAGE,
//       //       link: "https://bank.pixwave.com.br/signin",
//       //     });
//       //   }
//       //   if (verification == "declined") {
//       //     body = templateDeclined({
//       //       name: account.name.split(" ")[0],
//       //     });
//       //   }

//       //   const emailData: EmailInterface = {
//       //     sender: process.env.SENDER_EMAIL || "suporte@pixwave.com.br",
//       //     name: process.env.SENDER_NAME || "Pixwave Team",
//       //     email: account.email,
//       //     subject: "Status da abertura de conta, equipe Pixwave",
//       //     body,
//       //   };

//       //   await mail.send(emailData);
//       // }
//     //}
// //     return reply.status(200).send();
// //   } catch (error) {
// //     console.error(error);

// //     throw new AppError(error as unknown as IRequest);
// //   }
// // }
