import { FastifyInstance } from "fastify";
import { LostWebhookTransactions1Hour } from "./lostWebhookTransactions1Hour";
import { LostWebhookTransactions6Hour } from "./lostWebhookTransactions6Hours";

export async function LogsRoutes(app: FastifyInstance) {
  app.get("/transactions/one", LostWebhookTransactions1Hour);
  app.get("/transactions/six", LostWebhookTransactions6Hour);
}
