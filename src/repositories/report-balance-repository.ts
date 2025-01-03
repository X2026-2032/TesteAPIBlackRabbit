export interface ReportBalanceRepository {
  getBalance(accountId: string): Promise<number | null>;
}
