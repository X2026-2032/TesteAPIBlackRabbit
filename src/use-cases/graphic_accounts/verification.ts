import * as cron from "node-cron";
import { ApprovedTaxAutomaticGrapicAccountTransactionsUseCase } from "./approved-graphic-accounts-transactions-tax-automatic";

cron.schedule("*/10 * * * * *", async () => {
  try {
    await ApprovedTaxAutomaticGrapicAccountTransactionsUseCase.processPendingTransactions();
    console.log("Transações automáticas processadas com sucesso!");
  } catch (error: any) {
    console.error(`Erro ao processar transações automáticas: ${error.message}`);
  }
});
