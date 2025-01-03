import nodemailer from "nodemailer";

const {
  MAIL_HOST,
  MAIL_SERVICE,
  MAIL_PORT,
  MAIL_USER,
  MAIL_PASS,
  MAIL_SENDER,
} = process.env;

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "22b24fe37c2ff6",
    pass: "123456789",
  },
});

export async function sendEmail(subject: string, text: string, to: string) {
  const mailOptions = {
    from: `<${MAIL_SENDER}>`,
    to,
    subject,
    text,
    html: "<b>Recuperação de senha</b>",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado: " + info.response);

    return info.response;
  } catch (error) {
    console.error("Erro ao enviar o e-mail", error);
    return error;
  }
}
