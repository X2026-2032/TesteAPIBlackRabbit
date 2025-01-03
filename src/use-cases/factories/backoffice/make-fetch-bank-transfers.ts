import { FetchBackofficeBankTransfersUseCase } from "@/use-cases/backoffice/fetch-bank-transfers";

export function makeFetchBackofficeBankTransfers() {
  return new FetchBackofficeBankTransfersUseCase();
}
