import { FastifyInstance } from "fastify";
import { createBankSlip } from "./create-bank-slip";
import { getBankSlipById } from "./get-bank-slip";

import { getAllBankSlipsController } from "./get-all-bank-slips-controller";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { getMonthlyTotalPaidByUserIdController } from "./get-monthly-total-paid-controller";
import { getBankSlipPdfById } from "./get-bank-slipt-pdf-by-id-controller";
import { getByUserBankSlipController } from "./get-by-user-bankslip-controller";
import { getSlipById } from "./get-slip-by-id";
import { sendSlipToEmail } from "./send-slip-to-email";

export async function BankSlipRoutes(app: FastifyInstance) {
  app.get("/:id", getSlipById);
  app.post("/sendSlipToEmail", sendSlipToEmail);

  app.post("/", { onRequest: [verifyJwt] }, createBankSlip);
  app.get("/:id/pdf", { onRequest: [verifyJwt] }, getBankSlipPdfById);

  app.get(
    "/by/users/:userId",
    { onRequest: [verifyJwt] },
    getByUserBankSlipController,
  );

  app.get("/all-slips", { onRequest: [verifyJwt] }, getAllBankSlipsController);
  app.get(
    "/:userId/bank-slips",
    { onRequest: [verifyJwt] },
    getAllBankSlipsController,
  );
  app.get(
    "/:userId/monthly-total-paid",
    { onRequest: [verifyJwt] },
    getMonthlyTotalPaidByUserIdController,
  );
}
