import { env } from "@/env";
import { UsersRoutes } from "./http/controllers/users/routes";
import { AppError } from "./use-cases/errors/app-error";
import * as Sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import { GraphicAccountsRoutes } from "./http/controllers/graphic_accounts/routes";
import { AuthRoutes } from "./http/controllers/auth/routes";
import { BackofficeRoutes } from "./http/controllers/backoffice/routes";
import { Server, Socket } from "socket.io";
import { MediaRoutes } from "./http/controllers/media/routes";
import { NotificationRoutes } from "./http/controllers/notifications/routes";
import { AuthTokenRoutes } from "./http/controllers/auth_token/routes";
import { setupChatWebSocket } from "./websocket/chatWebSocketHandler";
import { TicketRoutes } from "./http/controllers/tickets/routes";

import generated from "@fastify/formbody";
import fastify, { FastifyRequest } from "fastify";
import fastifyCors from "@fastify/cors";
import { ZodError } from "zod";
import { DeviceRoutes } from "./http/controllers/device/routes";
import { DeviceTokenRoutes } from "./http/controllers/device_token/routes";
import { MessageRoutes } from "./http/controllers/privateMessage/routes";
import { GroupRoutes } from "./http/controllers/groups/routes";
import { InviteRoutes } from "./http/controllers/invites/routes";
import { ContactsRoutes } from "./http/controllers/contacts/routes";
import { AuthQrCodeRoutes } from "./http/controllers/auth-qr-code/routes";
import { sheetsRoutes } from "./http/controllers/sheets/routes";
import { hardCodedRoutes } from "./http/controllers/hardCoded/routes";

// if (env.NODE_ENV === "production") {
//   Sentry.init({
//     dsn: env.SENTRY_DSN,
//     tracesSampleRate: 1.0,
//     integrations: [
//       new RewriteFrames({
//         root: global.__dirname,
//       }),
//     ],
//   });
// }

// if (process.env.NODE_ENV === "production") {
//   createWebhooks();
// }

export const app = fastify({
  bodyLimit: 30000000, // + ou - 28MB
});

app.register(generated);

app.addHook("onResponse", async (request: FastifyRequest, reply) => {
  console.log(
    `\n<- Response ${reply.raw.statusCode} ${request.method} ${request.raw.url}`,
  );
});
app.addHook("onRequest", async (request: FastifyRequest, reply) => {
  console.log(
    `\n-> Request ${request.method} ${request.raw.url} authorization: ${request.raw.headers.authorization}`,
  );
});

export const io = new Server(app.server, {
  cors: { origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"] },
});

setupChatWebSocket(io);

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: "refreshToken",
    signed: false,
  },
});

app.register(fastifyCors);
app.register(fastifyCookie);
app.register(multipart);
app.register(UsersRoutes);
app.register(GraphicAccountsRoutes, { prefix: "graphic" });

app.register(AuthRoutes, { prefix: "auth" });
app.register(BackofficeRoutes, { prefix: "backoffice" });
app.register(AuthTokenRoutes, { prefix: "authToken" });
app.register(MediaRoutes, { prefix: "media" });
app.register(NotificationRoutes, { prefix: "notifications" });
app.register(TicketRoutes, { prefix: "tickets" });
app.register(DeviceRoutes);
app.register(DeviceTokenRoutes);
app.register(MessageRoutes, { prefix: "messages" });
app.register(GroupRoutes, { prefix: "group" });
app.register(InviteRoutes, { prefix: "invite" });
app.register(ContactsRoutes, { prefix: "contacts" });
app.register(AuthQrCodeRoutes);
app.register(sheetsRoutes);
app.register(hardCodedRoutes);

app.setErrorHandler((error: any, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: "Validation error.", issues: error.format() });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      friend: error.friend,
      data: error.data,
    });
  }

  if (env.NODE_ENV !== "production") {
    console.error(error);
  } else {
    // TODO: Here we should log to a external tool like DataDog/NewRelic/Sentry
    Sentry.captureException(error);
  }

  return reply.status(500).send({ message: "Internal server error." });
});

app
  .listen({
    host: "0.0.0.0",
    port: env.PORT ?? "3000",
  })
  .then(() => {
    console.log("🚀 HTTP Server Running!" + env.PORT);
  });
