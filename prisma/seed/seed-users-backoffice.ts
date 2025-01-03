import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

export class SeedUsersBackOffice {
  constructor(private readonly prisma: PrismaClient) {}

  public async execute() {
    await this.prisma.user.upsert({
      where: { email: "backoffice@pixwave.com.br" },
      update: {},
      create: {
        email: "backoffice@pixwave.com.br",
        name: "Usuário Master Pixwave",
        document: "71678444000139",
        phone: "",
        password: hashSync("backoffice@wave01", 8),
        role: "ADMIN",
        status: "active",
        type: "COMPANIE",
      },
    });
    await this.prisma.user.upsert({
      where: { email: "backoffice@ajiopay.com.br" },
      update: {},
      create: {
        email: "backoffice@ajiopay.com.br",
        name: "Usuário Master Pixwave",
        document: "67930015000120",
        phone: "",
        password: hashSync("backoffice@ajiopay01", 8),
        role: "MASTER",
        status: "active",
        type: "COMPANIE",
      },
    });
    await this.prisma.user.upsert({
      where: { document: "39778028000190" },
      update: {},
      create: {
        email: "admin@ajiopay.com.br",
        name: "Usuário Master Ajiopay",
        document: "39778028000190",
        phone: "",
        password: hashSync("", 8),
        role: "MEMBER",
        status: "active",
        type: "COMPANIE",
        refId: "a561e290-dc7e-45f9-b067-09d1faa6cf65",
      },
    });
    // await this.prisma.user.upsert({
    //   where: { document: "47076078023" },
    //   update: {},
    //   create: {
    //     email: "dev.marcus@gmail.com",
    //     name: "Marcus Antonio",
    //     document: "47076078023",
    //     phone: "31989292700",
    //     password: hashSync("A123456", 8),
    //     role: "MEMBER",
    //     status: "active",
    //     type: "COMPANIE",
    //     refId: "99f9f623-677e-43a9-85da-78ec36adb681",
    //   },
    // });
  }
}
