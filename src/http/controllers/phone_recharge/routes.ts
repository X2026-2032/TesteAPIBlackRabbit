import { FastifyInstance } from "fastify";
import { phoneRecharge } from "./phone-recharge";
import { finishRecharge } from "./finish-recharge";
import { verifyJwt } from "@/http/middlewares/verify-jwt";

export async function RechargePhoneRoutes(app: FastifyInstance) {
  app.post("/", { onRequest: [verifyJwt] }, phoneRecharge);
  app.post("/:id/confirm", { onRequest: [verifyJwt] }, finishRecharge);
}
