import { prisma } from "@/lib/prisma";
import { BankTransfer, Prisma } from "@prisma/client";
import { BankTransfersRepository } from "../bank-transfers-repository";
import { IParams } from "../dtos/params-dto";

export class PrismaBankTransfersRepository implements BankTransfersRepository {
  getByAccountId(id: string): Promise<BankTransfer[]> {
    return prisma.bankTransfer.findMany({
      where: { account_id: id },
      include: { account: { include: { user: true } } },
    });
  }

  create(data: Prisma.BankTransferUncheckedCreateInput): Promise<BankTransfer> {
    return prisma.bankTransfer.create({ data });
  }

  findAll(params?: IParams | undefined) {
    return prisma.$transaction([
      prisma.bankTransfer.count(),
      prisma.bankTransfer.findMany({
        skip: params?.pagination?.page,
        take: params?.pagination?.perPage,
        orderBy: { created_at: "desc" },
        include: { account: { include: { user: true } } },
      }),
    ]);
  }

  async findById(id: string): Promise<BankTransfer | null> {
    return prisma.bankTransfer.findUnique({
      where: {
        id,
      },
      include: { account: { include: { user: true } } },
    });
  }
}
