import { FetchBackofficeTransactionsByIdUseCase } from "@/use-cases/backoffice/fetch-transactions-by-id";

export function makeFetchBackofficeTransactionsByIdCase() {
  const fetchTransactionsUseCase = new FetchBackofficeTransactionsByIdUseCase();

  return fetchTransactionsUseCase;
}
