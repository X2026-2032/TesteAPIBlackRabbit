import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { createPixKeyClaimController } from "./create-pix-key-claims-controller";
import { createPixTransfers } from "./create-pix-transfer";
import { fetchPixKeys } from "./fetch-pix-keys";
import { confirmPixKey } from "./confirm-pix-key";
import { validatePixDecode } from "./validate-pix-decode";
import { registerPixKey } from "./register-pix-key";
import { createQRCodeStaticController } from "./create-pix-qr-code-static-controller";
import { createQRCodeDynamicController } from "./create-pix-qr-code-dynamic-controller";
import { redirectWebhook } from "./handle-delbank-charge-webhook";
import { api } from "@/lib/axios";
import { listPixFavoritesController } from "./favorites/list-pix-favorites";
import { createPixFavoriteController } from "./favorites/create-pix-favorite";
import { deletePixFavoriteController } from "./favorites/delete-pix-favorites";
import { checkPixFavoriteController } from "./favorites/check-pix-favorite";
import { deletePixKey } from "./delete-pix-key";
import { checkPixController } from "@/http/controllers/pix/check-pix-controller";
import { pixPaymentController } from "@/http/controllers/pix/payment";
import { verifySecurity } from "@/http/middlewares/verifySecurity";
import { pixPaymentQrCodeController } from "./payment-qrcode";

export async function PixRoutes(app: FastifyInstance) {
  // app.addHook("onRequest", verifyJwt);

  app.post("/", { onRequest: [verifyJwt] }, createPixTransfers); //criando pix
  app.get("/keys", { onRequest: [verifyJwt] }, fetchPixKeys);
  app.post("/decode", { onRequest: [verifyJwt] }, validatePixDecode);
  app.post("/register/key", { onRequest: [verifyJwt] }, registerPixKey);
  app.put("/confirm/key", { onRequest: [verifyJwt] }, confirmPixKey);

  app.post(
    "/keys/claims",
    { onRequest: [verifyJwt] },
    createPixKeyClaimController,
  );
  app.post(
    "/generate/static",
    { onRequest: [verifyJwt] },
    createQRCodeStaticController,
  );
  app.post("/keys/check", { onRequest: [verifyJwt] }, checkPixController);

  app.post(
    "/generate/dynamic",
    { onRequest: [verifyJwt] },
    createQRCodeDynamicController,
  );

  app.post(
    "/favorites",
    { onRequest: [verifyJwt] },
    createPixFavoriteController,
  );

  app.get("/favorites", { onRequest: [verifyJwt] }, listPixFavoritesController);

  app.delete(
    "/favorites/:id",
    { onRequest: [verifyJwt] },
    deletePixFavoriteController,
  );

  app.get(
    "/favorites/check/:keyPix",
    { onRequest: [verifyJwt] },
    checkPixFavoriteController,
  );

  app.post(
    "/payment",
    { onRequest: [verifyJwt, verifySecurity] },
    pixPaymentController,
  );

  app.post(
    "/payment/qrcode",
    { onRequest: [verifyJwt, verifySecurity] },
    pixPaymentQrCodeController,
  );

  app.post("/webhook", redirectWebhook);
  app.delete("/keys/:key_id", { onRequest: [verifyJwt] }, deletePixKey);

  app.get("/test", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await api.get(
        "https://api.delbank.com.br/baas/api/v2/transfers",
        {
          headers: {
            "x-delbank-api-key":
              "Ic0qN8fw7g5Yang0QlcAQqknmOGungc2dJlvDsjQ6UhNXjXPRueXr75KFSGR/mYwc1JAr+sSTBR0zMChjDaGkMZq+6Jiy5XWAV9MLsONtlE+PjQTMJ5XVtQJPnmDj/Eu",
          },
        },
      );

      reply.status(200).send(response.data);
    } catch (error: any) {
      reply.status(403).send(error?.response?.data);
    }
  });
}
