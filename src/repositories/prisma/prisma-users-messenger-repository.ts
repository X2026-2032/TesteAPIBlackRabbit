import { prisma } from "@/lib/prisma";
import { Prisma, GraphicAccount } from "@prisma/client";
import { GraphicAccountsUsersRepository, GraphicAccountUser } from "../users-messenger-respository";

export class PrismaGraphicAccountUsersRepository implements GraphicAccountsUsersRepository {


 

  async findById(id: string): Promise<GraphicAccount | null> {
    return prisma.graphicAccount.findUnique({
      where: {
        id,
      },
      include: {
        _count: true,
      },
    });
  }

  async create(data: Prisma.GraphicAccountCreateInput): Promise<GraphicAccount> {
    const user = await prisma.graphicAccount.create({
      data,
    });

    return user;
  }

  // async findById(id: string): Promise<GraphicAccountUser | null> {
  //   return prisma.graphicAccount.findUnique({
  //     where: {
  //       id,
  //     },
  //   });
  // }

  async findByUserName(userName: string): Promise<GraphicAccount | null> {
  return prisma.graphicAccount.findUnique({
    where: {
      userName,
    },
  });
}

  async save(data: GraphicAccount): Promise<GraphicAccount> {
    const user = await prisma.graphicAccount.update({
      where: {
        id: data.id,
      },
      data,
    });
  
    return user;
  }
}
