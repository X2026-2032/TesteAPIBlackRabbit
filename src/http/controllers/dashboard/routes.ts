import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { FastifyInstance } from "fastify";
import { customExtract } from "./dashboard-custom-extract";
export async function DashboardRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJwt);

  app.get("/custom-extract", customExtract);
}
