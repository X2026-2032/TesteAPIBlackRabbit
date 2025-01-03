import { FastifyInstance } from "fastify";

import { verifyJwt } from "@/http/middlewares/verify-jwt";

import { createGraphicAccounts } from "./create-graphic-accounts";
import { depositGraphicAccounts } from "./deposit-graphic-accounts";
import { withdrawGraphicAccounts } from "./withdraw-graphic-accounts";
import { fetchGraphicAccounts } from "./fetch-graphic-accounts";
import { fetchGrapicAccountTransactionsById } from "./fetch-transactions-by-id";
import { deniedGrapicAccountTransactions } from "./denied-transacions-graphic";
import { approvedGrapicAccountTransactions } from "./approved-transacions-graphic";
import { changeUserPassword } from "./changePasswordAccountGraphic";
import { updateAccountStatus } from "./update-transaction-status-graphic-account";
import { changeUserPasswordEletronic } from "./changePasswordEletronicAccountGraphic";
import { approvedTaxAutomaticGrapicAccountTransactions } from "./approved-transacions-graphic-tax-automatic";
import { listPlans } from "./list-plans";
import { sendCodeEmail } from "./send-code-email";
import { listCardByUserMachines } from "../backoffice/pagbank/card_machine/listCardMachinesByUser";
import { verifyEmail } from "./verifyEmail";
import { internalTransactionsBetweenWallet } from "@/http/controllers/graphic_accounts/internalTransactionsBetweenWallet";
import { getGraphicAccountByNumberIdentifier } from "./get-account-by-number-identifier";
import { verifySecurity } from "@/http/middlewares/verifySecurity";

export async function GraphicAccountsRoutes(app: FastifyInstance) {
  // app.addHook("onRequest", verifyJwt);

  app.get("/verify/email/:email/:cpf", verifyEmail);

  app.get("/", { onRequest: [verifyJwt] }, fetchGraphicAccounts);

  app.get(
    "/:id/transactions",
    { onRequest: [verifyJwt] },
    fetchGrapicAccountTransactionsById,
  );

  app.post(
    "/:id/transactions/denied",
    { onRequest: [verifyJwt] },
    fetchGrapicAccountTransactionsById,
  );

  app.post("/create", createGraphicAccounts);
  app.post("/deposit", { onRequest: [verifyJwt] }, depositGraphicAccounts);
  app.post("/withdraw", { onRequest: [verifyJwt] }, withdrawGraphicAccounts);
  app.get("/card-machines/:graphic_account_id", listCardByUserMachines);

  //nega transacao
  app.post(
    "/transactions/denied",
    { onRequest: [verifyJwt] },
    deniedGrapicAccountTransactions,
  );
  //aprova transacao
  app.post(
    "/transactions/approved",
    { onRequest: [verifyJwt] },
    approvedGrapicAccountTransactions,
  );

  app.post(
    "/transactions/approved-tax-automatic",
    { onRequest: [verifyJwt] },
    approvedTaxAutomaticGrapicAccountTransactions,
  );

  app.post(
    "/wallet-transfer",
    { onRequest: [verifyJwt, verifySecurity] },
    internalTransactionsBetweenWallet,
  );

  app.patch("/change-password/:id", changeUserPassword);
  app.patch("/change-password-eletronic/:id", changeUserPasswordEletronic);

  app.patch("/updateStatusGraphicTransaction/:id", updateAccountStatus);
  app.get("/plans", listPlans);

  app.get("/wallet-account/info", getGraphicAccountByNumberIdentifier);

  // app.get("/fee-limits", { onRequest: [verifyJwt] }, showFeeLimit);
  //
  // app.get("/fee-limits/master", { onRequest: [verifyJwt] }, showFeeLimitMaster);
  //
  // app.put(
  //   "/fee-limits/master/request",
  //   { onRequest: [verifyJwt] },
  //   RequestLimitDelbank,
  // );
  //
  // app.get("/fee-limits/:id", { onRequest: [verifyJwt] }, showFeeLimitById);
  //
  // app.get(
  //   "/fee-limits/change/request",
  //   { onRequest: [verifyJwt] },
  //   listFeeLimitRequestLimit,
  // );
  //
  // app.post(
  //   "/fee-limits/change/request/accept",
  //   { onRequest: [verifyJwt] },
  //   acceptFeeLimitRequestLimit,
  // );
  //
  // app.post(
  //   "/fee-limits/change/request/deny",
  //   { onRequest: [verifyJwt] },
  //   denyFeeLimitRequestLimit,
  // );
  //
  // app.post(
  //   "/fee-limits/config/limit",
  //   { onRequest: [verifyJwt] },
  //   configFeeLimit,
  // );
  // app.put(
  //   "/fee-limits/config/master/limit",
  //   { onRequest: [verifyJwt] },
  //   configFeeMasterLimit,
  // );
  // app.get(
  //   "/fee-limits/master/limit",
  //   { onRequest: [verifyJwt] },
  //   showFeeLimitMasterDatabase,
  // );
  //
  // app.post(
  //   "/fee-limits/change/request",
  //   { onRequest: [verifyJwt] },
  //   createFeeLimitRequestLimit,
  // );
  app.post("/sendCode", sendCodeEmail);
}
