import { Payer, Prisma } from "@prisma/client";

export interface PayerRepository {
  create(data: Prisma.PayerCreateInput): Promise<Payer>;
}
