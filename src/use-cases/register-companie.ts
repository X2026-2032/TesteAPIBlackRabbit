import { IdezSignupService } from "@/service/idez/signup";
import { User } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import generateUUID from "@/utils/generateUUID";
import { AppError } from "./errors/app-error";
import { extractImagesFromJson } from "@/utils/extractImagesFromJson";
import { api } from "@/lib/axios";

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
  document: string;
  phone: {
    ddd: string;
    number: string;
    type: string;
  };
  // email: string;
  password: string;
  //pin: string;
  address: Address;
  partners: Partner[];
  //franchise_id: string;
  // businessEmail: string;
  corporateName: string;
  fantasyName: string;
  constituitionType: string;
  activityCnae: string;
  //constituitionType: string;
  openingDate: string;
  isPoliticallyExposedPerson: boolean;
  amountMonthlyInvoicing: number;
  amountShareCapital: number;
  amountPatrimony: number;
  walletId: string;
}

interface RegisterfactoryResponse {
  user: User;
}

export class RegisterCompaniesUseCase {
  async execute(data: RegisterUseCaseRequest) {
    try {
      const wallet = await prisma.graphicAccount.findFirst({
        where: { id: data.walletId },
      });

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

      if (isUser || isGraphic) {
        throw new Error("Este documento já está em uso.");
      }

      let userId = "";

      let isUserIdUnique = false;

      while (!isUserIdUnique) {
        userId = generateUUID();

        const existingUser = await prisma.user.findFirst({
          where: {
            refId: userId,
          },
        });

        isUserIdUnique = !existingUser;
      }

      const oldWallet = await prisma.graphicAccount.findFirst({
        where: { id: data.walletId },
      });

      if (!oldWallet)
        throw new AppError({ message: "Wallet não encontrada..." });

      const documents = await prisma.verifyAuth.findFirst({
        where: {
          rg_cnh: oldWallet.rg_cnh!,
        },
      });

      const user = await prisma.user.create({
        data: {
          type: "LEGAL",
          name: data.fantasyName,
          email: wallet?.email || "",
          phone: data.phone,
          refId: userId,
          document: data.document,
          status: "PENDING_DOCUMENTATION",
          company_type: "02",
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
          account_number: "Em análise",
          account_digit: "Em análise",
          balance: 0,
          franchise_id: oldWallet.franchise_id,
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

      const updatedWallet = await prisma.graphicAccount.update({
        where: { id: oldWallet.id },
        data: { id_master_user: user.id, status_master_user: false },
      });

      const data_delbank = {
        ...data,
        partners: data.partners.map((p) => ({
          ...p,
          email: updatedWallet.email,
        })),
        businessEmail: updatedWallet.email,
      };
      const response = await new IdezSignupService().execute(
        data_delbank,
        "company",
      );

      if (documents && documents.data) {
        const documentsBase64 = await extractImagesFromJson(
          documents.data,
          oldWallet.id,
        );

        for (const item of documentsBase64) {
          await api.post(
            `/baas/api/v1/customers/${data.document}/documents`,
            {
              base64: item.base64,
              documentType: item.type,
            },
            {
              headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                "x-delbank-api-key": process.env.MASTER_API_KEY,
              },
            },
          );
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
