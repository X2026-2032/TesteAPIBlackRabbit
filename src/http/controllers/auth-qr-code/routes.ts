import { FastifyInstance } from "fastify";

import { CreateTokenQrCode } from "./create-token";
import { QrCodeLogin } from "./qr-code-login";
import { CheckTokenStatus } from "./check-token-status";

export async function AuthQrCodeRoutes(app: FastifyInstance) {
  app.post("/qr-token", CreateTokenQrCode);
  app.post("/qr-login", QrCodeLogin);
  app.get("/qr-status/:token", CheckTokenStatus);
}
