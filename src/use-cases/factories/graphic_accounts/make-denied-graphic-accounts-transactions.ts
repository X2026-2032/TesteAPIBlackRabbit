import { DeniedGrapicAccountTransactionsUseCase } from "@/use-cases/graphic_accounts/denied-graphic-accounts-transactions";

export function makeDeniedGrapicAccountTransactions() {
  return new DeniedGrapicAccountTransactionsUseCase();
}
