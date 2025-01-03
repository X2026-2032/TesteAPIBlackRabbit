import { FastifyInstance } from "fastify";

import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { verifyUserRole } from "@/http/middlewares/verify-user-role";
import { findAllBankTransfer } from "./find-all-bank-transfer";
import { getByUserBankTransferController } from "./get-by-user-bank-transfer";
import { createP2pTransfers } from "./create-p2p-transfer";
import { createBankTransfers } from "./create-bank-transfer";
import { createP2pTaxTransfers } from "./create-p2p-transfer-tax";
import { listAllUserTransactions } from "./list-all-user-transactions";
import { createBankTransfersWithPix } from "./create-bank-transfer-with-pix";
import { createP2pTransfersUser } from "./create-p2p-transfer-user";
import { createP2pWallet } from "./create-p2p-wallet";
import { createManualTax } from "./create-manual-tax";

export async function BankTransferRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJwt);

  app.post("/p2p", createP2pTransfers);
  app.post("/p2p/user", createP2pTransfersUser);
  app.post("/p2p/wallet", createP2pWallet);
  app.post("/p2p-tax", createP2pTaxTransfers);
  app.post("/manual-tax", createManualTax);

  app.post("/ted-doc", createBankTransfers);
  app.post("/ted-doc/pix", createBankTransfersWithPix);

  app.get("/", { onRequest: [verifyUserRole("ADMIN")] }, findAllBankTransfer);
  app.get(
    "/by/accounts/:id",
    { onRequest: [verifyUserRole("ADMIN")] },
    getByUserBankTransferController,
  );

  app.get("/transactions", listAllUserTransactions);
}
