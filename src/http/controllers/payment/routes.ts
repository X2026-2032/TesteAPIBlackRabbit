import { FastifyInstance } from "fastify";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { createPayment } from "./create-payment";
import { validatePayment } from "./validate-payment";
import { getSlipInfo } from "./getSlipInfo";

export async function PaymentRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJwt);

  app.post("/", createPayment);
  app.post("/validate", validatePayment);
  app.get("/slip/:digitableLine", getSlipInfo);
}
