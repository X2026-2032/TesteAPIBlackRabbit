import { prisma } from "@/lib/prisma";
import { Prisma, Account, User, GraphicAccount, Address } from "@prisma/client";
import { AccountsRepository } from "../accounts-repository";
import { IParams } from "../dtos/params-dto";

export class PrismaAccountsRepository implements AccountsRepository {
  findAll(params: IParams): any {
    throw new Error("Não implementado");
  }

  async findById(
    id: string,
    role?: "WALLET" | "MEMBER",
  ): Promise<Account | (GraphicAccount & { address: Address | null }) | null> {
    const where = role ? { role } : {};

    const graphic = await prisma.graphicAccount.findFirst({
      where: { ...where, id: id },
    });

    if (graphic) {
      const address = await prisma.address.findFirst({
        where: { graphicId: graphic.id },
      });

      return { ...graphic, address };
    }

    return prisma.account.findUnique({
      where: {
        id,
      },
      include: { user: { include: { Address: true } } },
    });
  }

  async create(data: Prisma.AccountUncheckedCreateInput): Promise<Account> {
    const user = await prisma.account.create({
      data,
    });

    return user;
  }

  async findByUserId(userId: string): Promise<Account | null> {
    return prisma.account.findFirst({
      where: {
        user_id: userId,
      },
    });
  }

  async findByRefId(refId: string): Promise<Account | null> {
    return prisma.account.findFirst({
      where: {
        refId,
      },
    });
  }

  async save(data: Account): Promise<Account> {
    const account = await prisma.account.update({
      where: {
        id: data.id,
      },
      data,
    });

    return account;
  }

  async update(
    id: string,
    data: Partial<Prisma.AccountUpdateInput>,
  ): Promise<Account> {
    const account = await prisma.account.update({
      where: {
        id,
      },
      data,
    });

    return account;
  }
}
