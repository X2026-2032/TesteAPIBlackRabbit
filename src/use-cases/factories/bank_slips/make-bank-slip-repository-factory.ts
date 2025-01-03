import { BankSlipRepository } from "@/repositories/bank-slip-repository";
import { PrismaBankSlipRepository } from "@/repositories/prisma/prisma-bank-slip-repository";

export function createBankSlipRepository(): BankSlipRepository {
  return new PrismaBankSlipRepository();
}

export const bankSlipRepository: BankSlipRepository =
  createBankSlipRepository();
