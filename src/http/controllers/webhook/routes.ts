import { FastifyInstance } from "fastify";
import { webHook } from "./create-transaction";
export async function WebhookRoutes(app: FastifyInstance) {
  app.post("/", webHook);
}
