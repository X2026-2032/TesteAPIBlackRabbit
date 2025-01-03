import nodemailer from "nodemailer";
import { IDeviceTokenRepository } from "@/repositories/device-token-repository";
import { Chance } from "chance";
import { Device } from "../device/create-device-usecase";
import CryptoJS from "crypto-js";
import { prisma } from "@/lib/prisma";

const chance = new Chance();

const mailHost = process.env.MAIL_HOST;
const mailPort = process.env.MAIL_PORT
  ? parseInt(process.env.MAIL_PORT)
  : undefined;
const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;

if (!mailHost || !mailPort || !mailUser || !mailPass) {
  throw new Error("Variáveis de ambiente não definidas");
}

const transporter = nodemailer.createTransport({
  host: mailHost,
  port: mailPort,
  auth: { user: mailUser, pass: mailPass },
});

export class SendEmailTokenUseCase {
  constructor(private deviceTokenRepository: IDeviceTokenRepository) {}

  async execute(email: string, user_id: string, device: Device): Promise<void> {
    const account = await prisma.graphicAccount.findFirst({
      where: {
        id: user_id,
      },
    });

    const emailToken = await this.deviceTokenRepository.findByUserId(user_id);

    if (emailToken) {
      await this.deviceTokenRepository.delete(emailToken.id);
    }

    const token = chance.string({ length: 6, numeric: true });

    const mailOptions = {
      from: `<${process.env.MAIL_SENDER}>`,
      to: email,
      subject: "Validação de dispositivo",
      text: `Seu código para validação do dispositivo: ${token}`,
      html: `<p>Seu código para validação do dispositivo: <strong>${token}</strong></p>
             <p><b>Caso não tenha feito essa solicitação, por favor, entre em contato conosco</b></p>`,
    };

    const key = CryptoJS.enc.Utf8.parse(process.env.JWT_SECRET as string);
    const iv = CryptoJS.enc.Utf8.parse(process.env.IV_KEY as string);

    const deviceHash = CryptoJS.AES.encrypt(JSON.stringify(device), key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    try {
      await transporter
        .sendMail(mailOptions)
        .then(() => {
          console.log("Email enviado com sucesso!");
        })
        .catch((error) => {
          console.error("Erro ao enviar o e-mail", error);
        });

      if (account) {
        await this.deviceTokenRepository.create({
          graphic_id: user_id,
          user_id: undefined,
          token,
          device: deviceHash.toString(),
          valid: false,
        });

        return;
      }

      await this.deviceTokenRepository.create({
        user_id,
        token,
        device: deviceHash.toString(),
        valid: false,
      });
    } catch (error: any) {
      return error;
    }
  }
}
