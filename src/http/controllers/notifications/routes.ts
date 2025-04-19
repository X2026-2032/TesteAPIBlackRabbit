import { FastifyInstance } from "fastify";
import webpush from "web-push";
import { z } from "zod";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { listNotifications } from "./list-notifications";
import { setReadNotifications } from "./set-read-notification";
import { io } from "@/app";

// Configurar Web Push com chaves do ambiente
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
};

webpush.setVapidDetails(
  "mailto:teste@testefake.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);
console.log(
  "Chaves VAPID configuradas:",
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

// Armazena assinaturas dos usuários (poderia estar num banco de dados)
const subscriptions: any[] = [];
console.log("Inscrições: ", subscriptions);

export async function NotificationRoutes(app: FastifyInstance) {
  // Rota para listar notificações (já existente)
  app.get("", { onRequest: [verifyJwt] }, listNotifications);

  // Rota para marcar notificações como lidas (já existente)
  app.get("/read", { onRequest: [verifyJwt] }, setReadNotifications);

  // Rota para inscrever usuários nas notificações push
  app.post("/subscribe", { onRequest: [verifyJwt] }, async (request, reply) => {
    const schema = z.object({
      endpoint: z.string(),
      keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
      }),
    });

    const subscription = schema.parse(request.body);
    subscriptions.push(subscription);
    reply.send({ message: "Inscrição para notificações salva!" });
  });

  // Rota para enviar notificações push para todos os inscritos
  app.post(
    "/sendNotification",
    { onRequest: [verifyJwt] },
    async (request, reply) => {
      const payload = JSON.stringify({
        title: "Nova Mensagem!",
        body: "Você recebeu uma nova mensagem no chat.",
      });

      subscriptions.forEach((sub) => {
        webpush
          .sendNotification(sub, payload)
          .then(() => console.log("Notificação enviada com sucesso!"))
          .catch((err: any) => {
            console.error("Erro ao enviar notificação:", err);
          });
      });

      // Emitindo para os clientes via Socket.IO
      io.emit("new_notification", {
        title: "Nova Mensagem!",
        content: "Você recebeu uma nova mensagem no chat.",
      });

      reply.send({ message: "Notificação enviada!" });
    },
  );
}
