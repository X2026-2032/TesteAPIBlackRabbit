import { FastifyInstance } from "fastify";

import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { listNotifications } from "./list-notifications";
import { setReadNotifications } from "./set-read-notification";

export async function NotificationRoutes(app: FastifyInstance) {
  app.get("", { onRequest: [verifyJwt] }, listNotifications);
  app.get("/read", { onRequest: [verifyJwt] }, setReadNotifications);
}
