import { FetchGraphicTransactionsById } from "@/use-cases/graphic_accounts/fetch-transactions-by-id";

export function makeFetchGrapicAccountTransactions() {
  return new FetchGraphicTransactionsById();
}
