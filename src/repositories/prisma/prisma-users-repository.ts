import { prisma } from "@/lib/prisma";
import { Prisma, User } from "@prisma/client";
import { UsersRepository, UserWithAccount } from "../users-respository";

export class PrismaUsersRepository implements UsersRepository {
  async findByDocumentWithAccount(
    document: string,
  ): Promise<UserWithAccount | null> {
    return prisma.user.findUnique({
      where: {
        document,
      },
      include: {
        // Account: {
        //   select: {
        //     refId: true,
        //     branch_number: true,
        //     account_number: true,
        //     account_digit: true,
        //   },
        // },
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        id,
      },
      include: {
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = await prisma.user.create({
      data,
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findByDocument(document: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        document,
      },
    });
  }

  async save(data: User): Promise<User> {
    const user = await prisma.user.update({
      where: {
        id: data.id,
      },
      data,
    });

    return user;
  }
}
