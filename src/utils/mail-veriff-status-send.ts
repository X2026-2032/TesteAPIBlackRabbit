// Importe sua classe Mail
import fastify from "fastify";
import { Mail, EmailInterface } from "./mail";

// Crie uma instância da classe Mail
const mail = new Mail();

// Evento para lidar com o webhook do Veriff
(fastify as any).post("/webhook/veriff", async (request: any, reply: any) => {
  const { status, userEmail } = request.body; // Supondo que você receba o status e o email do usuário do Veriff

  // Lógica para determinar o corpo do email com base no status (você pode personalizar isso conforme necessário)
  let body = "";
  if (status === "approved") {
    body = "Seu documento foi aprovado!";
  } else if (status === "pending") {
    body = "Seu documento está pendente de revisão.";
  } else if (status === "rejected") {
    body =
      "Seu documento foi rejeitado. Por favor, entre em contato para mais informações.";
  }

  // Configuração dos dados do email
  const emailData: EmailInterface = {
    sender: process.env.SENDER_EMAIL || "sac@arcobank.com.br",
    name: process.env.SENDER_NAME || "Arco Bank Team",
    email: userEmail,
    subject: "Status da abertura de conta, equipe Arco Bank",
    body: body,
  };

  try {
    // Enviar o email
    await mail.send(emailData);

    // Responder ao webhook
    reply.send({ success: true });
  } catch (error) {
    console.error("Erro ao enviar o email:", error);
    reply
      .status(500)
      .send({ success: false, message: "Erro ao enviar o email" });
  }
});
