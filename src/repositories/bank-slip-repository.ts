import { TransactionsParams } from "@/utils/transaction-query-params";
import { Prisma, BankSlip } from "@prisma/client";
import { RouteGenericInterface } from "fastify";

export type BankSlipStatus = "waiting" | "paid";

export interface BankSlipRepository {
  create(data: Prisma.BankSlipCreateInput): Promise<BankSlip>;
  findById(id: string): Promise<BankSlip | null>;
  getAllBankSlips(): Promise<BankSlip[]>;
  getPaginatedBankSlips(
    userId: string,
    queryParams: Partial<TransactionsParams>,
  ): Promise<BankSlip[]>;
  count(): Promise<number>;
  findByUserId(userId: string): Promise<BankSlip[]>;
  getMonthlyTotalPaidByUserId(userId: string): Promise<number>;
}
export { BankSlip };

interface BankSlipRequest extends RouteGenericInterface {
  Querystring: {
    page: string;
    query: string;
  };
}
export { BankSlipRequest };
