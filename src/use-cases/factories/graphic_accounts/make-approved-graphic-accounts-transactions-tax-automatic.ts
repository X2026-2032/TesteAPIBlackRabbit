import { ApprovedTaxAutomaticGrapicAccountTransactionsUseCase } from "@/use-cases/graphic_accounts/approved-graphic-accounts-transactions-tax-automatic";

export function makeApprovedTaxAutomaticGrapicAccountTransactions() {
  return new ApprovedTaxAutomaticGrapicAccountTransactionsUseCase();
}
