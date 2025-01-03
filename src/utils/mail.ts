import nodemailer from "nodemailer";

export interface FileInterface {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
  location?: string;
}

export interface EmailInterface {
  sender: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  attachments?: FileInterface[];
}

export class Mail {
  async send(data: EmailInterface) {
    try {
      const mail = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        service: process.env.MAIL_SERVICE,
        port: 587,
        secure: true,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await mail.sendMail({
        from: `${process.env.MAIL_FROM_NAME} <${data.sender}>`,
        to: `${data.name} <${data.email}>`,
        subject: data.subject,
        html: data.body,
        attachments: data.attachments,
      });
    } catch (error) {
      console.log("esse erro", error);
      throw new Error("Erro ao enviar o e-mail");
    }
  }
}
