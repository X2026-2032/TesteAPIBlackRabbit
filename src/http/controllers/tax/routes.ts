import { FastifyInstance } from "fastify";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { verifyTax } from "./verify-tax";

export async function TaxRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJwt);

  app.post("/verify", verifyTax);
}
