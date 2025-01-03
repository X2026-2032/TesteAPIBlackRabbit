import { FastifyInstance } from "fastify";

import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { sendVerificationCode } from "./send-verification-code";
import { getAccountByDocument } from "./get-account-by-document";
import { updatePinAndSecurityEletronic } from "./update-password-eletronic-and-pin";
import { updateAccountController } from "./update-account-controller";
import { getWalletAccount } from "./get-wallet-account";
import { getBalanceByReportBalance } from "./get-balance-by-report-balance";

export async function AccountsRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJwt);

  app.post("/send-verification", sendVerificationCode);
  app.get("/account/info", getAccountByDocument);
  app.get("/account/info/wallet", getWalletAccount);
  app.get("/account/balance", getBalanceByReportBalance);

  app.patch(
    "/update-security-password-eletronic/:id",
    updatePinAndSecurityEletronic,
  );
  app.patch("/accounts/:userId", updateAccountController);
}
