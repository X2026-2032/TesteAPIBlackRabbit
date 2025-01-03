import { FastifyInstance } from "fastify";
import { sendEmail } from "./send-email-token";
import { validEmailToken } from "./valid-email-token";
import { verifyJwt } from "@/http/middlewares/verify-jwt";

export async function DeviceTokenRoutes(app: FastifyInstance) {
  app.post("/send-email-token", { onRequest: [verifyJwt] }, sendEmail);
  app.post(
    "/validate-email-token",
    { onRequest: [verifyJwt] },
    validEmailToken,
  );
}
