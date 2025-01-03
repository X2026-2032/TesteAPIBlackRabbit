import { FastifyInstance } from "fastify";

import { verifyJwt } from "@/http/middlewares/verify-jwt";

import { fetchBackofficeAccounts } from "./fetch-all-accounts";
import { verifyUserRole } from "@/http/middlewares/verify-user-role";
import { fetchBackofficeAccountsById } from "./fetch-account-by-id";
import { fetchBackofficeTransactions } from "./fetch-transations";
import { fetchBackofficeTransactionsById } from "./fetch-transactions-by-id";
import { fetchBackofficeAccountsTransactions } from "./fetch-accounts-transations";
import { fetchBackofficeBankTransfers } from "./featch-bank-transfers";
import { fetchTaxConfigurations } from "./fetch-tax-configurations";
import { updateTaxConfigurations } from "./update-tax-configurations";
import { updatePlans } from "./update-plan";
import { createPlans } from "./create-plan";
import { listPlans } from "./list-plans";
import { listUsers } from "./list-users";
import { listCardMachines } from "./pagbank/card_machine/listCardMachines";
import { createCardMachine } from "./pagbank/card_machine/creatCardMachine";
import { deleteCardMachine } from "./pagbank/card_machine/deleteCardMachine";
import { updateCardMachine } from "./pagbank/card_machine/updateCardMachine";
import { createPagPlan } from "./pagbank/pag_plans/create-pag-plan";
import { listPagBank } from "./pagbank/pag_plans/list-pag-plan";
import { updatePagBank } from "./pagbank/pag_plans/update-pag-plan";
import { deletePagBank } from "./pagbank/pag_plans/delete-pag-plan";
import { listCardByUserMachines } from "./pagbank/card_machine/listCardMachinesByUser";
import { updateTaxConfiguration } from "./pagbank/pag_plans/update-tax-configuration";
import { listUsersAdmin } from "./list-users-admin";
import { listValueTotal } from "./dellbank/list-value-total";
import { saveTransaction } from "./dellbank/save-transaction";
import { createOperator } from "./operators/create-operator";
import { fetchOperators } from "./operators/fetch-operators";
import { deleteOperator } from "./operators/delete-operator";
import { updateOperator } from "./operators/update-operator";
import { Export } from "./export";
import { createIndividualAccount } from "./accounts/create-individual-account";
import { createCompaineAccount } from "./accounts/create-compaine-account";
import { createAccountDocument } from "./accounts/create-account-document";
import { fetchNotifications } from "./notifications/fetch-notiffications";
import { FindUserAdmin } from "./find-user";
import { showFeeLimitByAccountId } from "./show-fee-limit-by-accountId";
import { getAllTransactionsAndTax } from "./get-all-transactions-and-tax";
import { getAllGraphicTransactionsAndTax } from "./get-all-transactions-and-graphic-and-all-tax";
import { ExportMachine } from "./export/export-machine";

const exportController = new Export();
const exportMachineController = new ExportMachine();

export async function BackofficeRoutes(app: FastifyInstance) {
  app.addHook("onRequest", verifyJwt);
  app.addHook(
    "onRequest",
    verifyUserRole(["ADMIN", "MASTER", "ADMIN_BAG", "OPERATOR"]),
  );

  app.get(
    "/fee-limits/:accountId",
    { onRequest: [verifyJwt] },
    showFeeLimitByAccountId,
  );

  app.get("/all/count/transactions", getAllTransactionsAndTax);
  app.get("/all/count/transactions/tax", getAllGraphicTransactionsAndTax);

  app.get("/accounts", fetchBackofficeAccounts);
  app.post("/accounts/individual", createIndividualAccount);
  app.post("/accounts/compaine", createCompaineAccount);
  app.post("/accounts/document", createAccountDocument);

  app.get("/accounts/:id", fetchBackofficeAccountsById);
  app.get("/accounts/:id/transactions", fetchBackofficeAccountsTransactions);

  app.get("/transactions", fetchBackofficeTransactions);
  app.get("/transactions/:id", fetchBackofficeTransactionsById);
  app.get("/bank-transfers", fetchBackofficeBankTransfers);

  app.get("/tax-configurations", fetchTaxConfigurations);
  app.put("/tax-configurations", updateTaxConfigurations);

  app.post("/plans", createPlans);
  app.put("/plans", updatePlans);
  app.get("/plans", listPlans);

  app.get("/users", listUsers);
  app.get("/users/admin", listUsersAdmin);
  app.get("/user/:document", FindUserAdmin);
  app.get("/users/:id/total-value", listValueTotal);
  app.post("/users/save-transaction", saveTransaction);

  app.get("/card-machines", listCardMachines);
  app.post("/card-machines", createCardMachine);
  app.delete("/card-machines/:id", deleteCardMachine);
  app.patch("/card-machines/:id", updateCardMachine);
  app.get("/card-machines/:graphic_account_id", listCardByUserMachines);

  app.get("/pag-plans", listPagBank);
  app.post("/pag-plans", createPagPlan);
  app.put("/pag-plans/:id", updatePagBank);
  app.put("/pag-plans/tax", updateTaxConfiguration);
  app.delete("/pag-plans/:id", deletePagBank);

  app.post("/operators", createOperator);
  app.get("/operators", fetchOperators);
  app.delete("/operators/:id", deleteOperator);
  app.put("/operators/:id", updateOperator);
  app.post("/export/pdf", exportController.execute);

  app.get("/notifications", fetchNotifications);

  app.post("/export/machine", exportMachineController.execute);
}
