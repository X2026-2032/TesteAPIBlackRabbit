import { prisma } from "@/lib/prisma";
import { IdezAccounts } from "@/service/idez/accounts";
import { AppError } from "@/use-cases/errors/app-error";
import generateUUID from "@/utils/generateUUID";
import { hashSync } from "bcryptjs";

export default class CreatePersonalAccountUseCase {
  static async execute(data: Data) {
    const userExists = await prisma.user.findFirst({
      where: { OR: [{ document: data.document }, { email: data.email }] },
    });

    if (userExists)
      throw new AppError({ message: "User already exists", status: 409 });

    let userId: string;

    let isUserIdUnique = false;

    // Loop até encontrar um userId único
    while (!isUserIdUnique) {
      userId = generateUUID();

      const existingUser = await prisma.user.findFirst({
        where: {
          refId: userId,
        },
      });

      // Se não houver usuário com o mesmo userId, marca como único
      isUserIdUnique = !existingUser;
    }

    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          type: "NATURAL",
          name: data.name,
          email: data.email,
          phone: data.phone,
          refId: userId,
          document: data.document,
          status: "PENDING_DOCUMENTATION",
          password: hashSync(data.password, 6),
          monthly_invoicing: data.monthlyInvoicing,
          planId: data.planId,
        },
      });

      const newAccount = await tx.account.create({
        data: {
          balance: 0,
          user_id: user.id,
          refId: userId,
          status: "PENDING_DOCUMENTATION",
          branch_number: "Em análise",
          account_number: "Em análise",
          account_digit: "Em análise",
          pin: data.pin,
          security_eletronic: data.securityEletronic,
        },
      });

      await tx.accountUsers.create({
        data: {
          user_id: user.id,
          account_id: newAccount.id,
        },
      });

      await tx.accountToken.create({
        data: {
          account_id: newAccount.id,
          access_token: user.access_token ?? "token",
        },
      });

      const response = await new IdezAccounts().people({ ...data });

      return user;
    });
  }
}

export type Data = {
  name: string;
  document: string;
  birthDate: string;
  email: string;
  planId: string;
  phone: {
    number: string;
    ddd: string;
    type: string;
  };
  address: {
    zipCode: string;
    cityName: string;
    publicPlace: string;
    neighborhood: string;
    state: string;
    number: string;
    complement: string;
    type: string;
  };
  monthlyInvoicing: number;
  educationLevel: string;
  gender: string;
  password: string;
  pin: string;
  securityEletronic: string;
  maritalStatus: string;
};
