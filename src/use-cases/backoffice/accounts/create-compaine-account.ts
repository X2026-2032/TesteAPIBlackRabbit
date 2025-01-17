import { IdezSignupService } from "@/service/idez/signup";
import { User } from "@prisma/client";
import { UsersRepository } from "@/repositories/users-messenger-respository";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import generateUUID from "@/utils/generateUUID";

interface Address {
  state: string;
  cityName: string;
  isConfirmed: boolean;
  type: string;
  publicPlace: string;
  number: string;
  zipCode: string;
  neighborhood: string;
  complement: string;
}

interface Partner {
  document: string;
  name: string;
  birthDate: string;
  // email: string;
  mother_name: string;
  address: {
    // address_id: string;
    isConfirmed: boolean;
    type: string;
    publicPlace: string;
    number: string;
    zipCode: string;
    neighborhood: string;
    complement: string;
  };
}

interface RegisterUseCaseRequest {
  security_eletronic: string;
  //  name: string;
  mother_name: string;
  constituitionType: string;
  document: string;
  phone: {
    ddd: string;
    number: string;
    type: string;
  };
  // email: string;
  password: string;
  email: string;
  //pin: string;
  address: Address;
  partners: Partner[];
  //franchise_id: string;
  // businessEmail: string;
  corporateName: string;
  fantasyName: string;
  activityCnae: string;
  //constituitionType: string;
  openingDate: string;
  isPoliticallyExposedPerson: boolean;
  amountMonthlyInvoicing: number;
  amountShareCapital: number;
  amountPatrimony: number;
}

interface RegisterfactoryResponse {
  user: User;
}

export class CreateCompaineAccountUseCase {
  constructor(private usersRepository: UsersRepository) {}

  static async execute(data: RegisterUseCaseRequest) {
    try {
      const isGraphic = await prisma.graphicAccount.findFirst({
        where: {
          OR: [
            {
              document: data.document,
            },
          ],
        },
      });

      const isUser = await prisma.user.findFirst({
        where: {
          document: data.document,
        },
      });

      if (!!isUser || isGraphic) {
        throw new Error("Este documento já está em uso.");
      }

      let userId = "";

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

      const user = await prisma.user.create({
        data: {
          type: "LEGAL",
          name: data.fantasyName,
          email: data.email,
          phone: data.phone,
          refId: userId,
          document: data.document,
          status: "PENDING_DOCUMENTATION",
          company_type: data.constituitionType,
          password: hashSync(data.password, 6),
        },
      });

      const [partner] = data.partners;
      const address_id = uuidv4();

      await prisma.partner.create({
        data: {
          user_id: user.id,
          name: partner.name,
          partnerId: uuidv4(),
          document: partner.document,
          birth_date: partner.birthDate,
          mother_name: partner.mother_name,
          address_id,
        },
      });

      const newAccount = await prisma.account.create({
        data: {
          user_id: user.id,
          refId: userId,
          status: user.status,
          alias_status: user.status,
          branch_number: "Em análise",
          account_number: "0000",
          account_digit: "0",
          balance: 0,
          security_eletronic: data.security_eletronic,
        },
      });

      await prisma.accountUsers
        .create({
          data: {
            user_id: user.id,
            account_id: newAccount.id,
          },
        })
        .catch((e) => {
          console.error(e);
        });

      await prisma.accountToken.create({
        data: {
          account_id: newAccount.id,
          access_token: "token",
        },
      });

      const response = await new IdezSignupService().execute(
        {
          ...data,
          partners: data.partners.map((p) => ({ ...p, email: user.email })),
          businessEmail: user.email,
        },
        "company",
      );

      return user;
    } catch (error: any) {
      console.log(error);
      console.log(error?.response?.data?.errors);
      throw error;
    }
  }
}
