import { FastifyInstance } from "fastify";

import { verifyJwt } from "@/http/middlewares/verify-jwt";

import { createGraphicAccounts } from "./create-graphic-accounts";
import { fetchAllGraphicAccounts, fetchGraphicAccounts } from "./fetch-graphic-accounts";
import { changeUserPassword } from "./changePasswordAccountGraphic";
import { changeUserPasswordEletronic } from "./changePasswordEletronicAccountGraphic";
import { sendCodeEmail } from "./send-code-email";
import { verifyEmail } from "./verifyEmail";
import { getGraphicAccountByNumberIdentifier } from "./get-account-by-number-identifier";
import { deleteUserByUserName } from "@/use-cases/graphic_accounts/delete-graphic_accounts";
import { updatePublicKey } from "./updatePublickKey";

export async function GraphicAccountsRoutes(app: FastifyInstance) {
  // app.addHook("onRequest", verifyJwt);

  app.get("/verify/email/:email/:cpf", verifyEmail);

  app.get("/", { onRequest: [verifyJwt] }, fetchAllGraphicAccounts);

  app.get("/userName/:userName", fetchGraphicAccounts);
  
  app.patch("/:userName/update-publickey", updatePublicKey);

  app.delete("/delete", {
    schema: {
      body: {
        type: "object",
        properties: {
          userName: { type: "string" }
        },
        required: ["userName"]
      }
    },
    onRequest: [verifyJwt]
  }, deleteUserByUserName);




  


  app.post("/create", createGraphicAccounts);
 
 
 

  // app.post(
  //   "/wallet-transfer",
  //   { onRequest: [verifyJwt, verifySecurity] },
  //   internalTransactionsBetweenWallet,
  // );

  app.patch("/change-password/:id", changeUserPassword);
  app.patch("/change-password-eletronic/:id", changeUserPasswordEletronic);

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
