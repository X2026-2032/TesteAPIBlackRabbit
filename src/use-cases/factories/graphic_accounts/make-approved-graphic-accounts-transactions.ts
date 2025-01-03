import { ApprovedGrapicAccountTransactionsUseCase } from "@/use-cases/graphic_accounts/approved-graphic-accounts-transactions";

export function makeApprovedGrapicAccountTransactions() {
  return new ApprovedGrapicAccountTransactionsUseCase();
}
