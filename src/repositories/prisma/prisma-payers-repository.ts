import { Payer, Prisma, PrismaClient } from "@prisma/client";
import { PayerRepository } from "../payer-repository";

const prisma = new PrismaClient();

export class PrismaPayerRepository implements PayerRepository {
  async create(data: Prisma.PayerCreateInput): Promise<Payer> {
    return prisma.payer.create({ data });
  }
}
