import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import nodemailer from "nodemailer";

function generateRandomCode() {
  return Math.floor(Math.random() * 900000) + 100000;
}

async function sendCodeEmail(request: FastifyRequest, reply: FastifyReply) {
  try {
    const requestBody = request.body as { email: string };

    let user = (await prisma.graphicAccount.findFirst({
      where: {
        email: requestBody.email,
      },
    })) as any;

    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          email: requestBody.email,
        },
      });
    }
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const code = await generateRandomCode();

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    } as nodemailer.TransportOptions);
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Código de verificação",
      text: `Seu código de verificação é ${code}`,
    };
    await transporter.sendMail(mailOptions);

    return reply.status(200).send({ userId: user.id, code: code.toString() });
  } catch (error: any) {
    throw new Error(error);
  }
}

export { sendCodeEmail };
