import { FetchBackofficeAccountsTransactionsUseCase } from "@/use-cases/backoffice/fetch-accounts-transations";

export function makeFetchBackofficeAccountTransactions() {
  return new FetchBackofficeAccountsTransactionsUseCase();
}
