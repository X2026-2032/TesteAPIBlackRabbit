import { IdezAccounts } from "@/service/idez/accounts";
import { UsersRepository } from "@/repositories/users-messenger-respository";
import { prisma } from "@/lib/prisma";
import generateUUID from "@/utils/generateUUID";
import { AppError } from "../errors/app-error";
import { extractImagesFromJson } from "@/utils/extractImagesFromJson";
import { api } from "@/lib/axios";

interface Address {
  state?: string; //only the UF code
  publicPlace: string;
  number?: string;
  zipCode: string; //only numbers
  neighborhood: string;
  complement?: string;
  isConfirmed: boolean;
  type: string;
  cityId?: number;
  cityName?: string;
}

interface RegisterUseCaseRequest {
  //is_pep: boolean;
  //is_foreign: boolean;
  userId?: string;
  name: string;
  document: string;
  // email: string;
  birthDate: string;
  security_eletronic: string;
  planId: string;
  // mother_name: string;
  phone: {
    ddd: string;
    number: string;
    type: string;
  };
  // identity_type: string;
  // identity_number: string;
  // identity_issued_at: string;
  educationLevel: string;
  maritalStatus: string;
  gender: string;
  monthlyInvoicing: number;
  password?: string;
  pin?: string;
  address: Address;
  // occupation_id: string;
  franchise_id?: string;
}

export class RegisterIndividualsUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(data: RegisterUseCaseRequest, walletId: string) {
    try {
      const isUser = await prisma.user.count({
        where: {
          OR: [
            {
              document: data.document,
            },
          ],
        },
      });

      if (isUser) throw new Error("Este documento já está em uso.");

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

      const wallet = await prisma.graphicAccount.findFirst({
        where: { id: walletId, role: "WALLET" },
      });

      if (!wallet)
        throw new AppError({
          message: "Wallet account not found",
          status: 400,
        });

      const documents = await prisma.verifyAuth.findFirst({
        where: {
          rg_cnh: wallet.rg_cnh!,
        },
      });

      let result = {} as any;

      const currentUser = await prisma.user.findFirst({
        where: { id: data.userId },
      });

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            type: "NATURAL",
            name: data.name,
            email: wallet.email!,
            phone: data.phone,
            refId: userId,
            document: data.document,
            status: "PENDING_DOCUMENTATION",
            password: currentUser ? currentUser.password : data.password,
            //  occupation_id: data.occupation_id,
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
            franchise_id: wallet.franchise_id,
            pin: data.pin,
            security_eletronic: data.security_eletronic,
          },
        });

        const walletUpdated = await prisma.graphicAccount.update({
          where: {
            id: wallet.id,
          },
          data: {
            id_master_user: user.id,
            status_master_user: false,
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

        const raw = {
          phone: {
            type: "CELL",
            ddd: data.phone.ddd,
            number: data.phone.number,
          },
          educationLevel: mapEducationLevelToTranslation(data.educationLevel),
          maritalStatus: mapMaritalStatusToTranslation(data.maritalStatus),
          gender: "MALE",
          address: {
            isConfirmed: true,
            type: "RESIDECIAL",
            publicPlace: data.address.publicPlace,
            number: data.address.number,
            zipCode: data.address.zipCode,
            neighborhood: data.address.neighborhood,
            complement: null,
          },
          document: data.document,
          name: data.name,
          monthlyInvoicing: data.monthlyInvoicing,
          birthDate: data.birthDate,
          email: wallet.email,
        };

        const response = await new IdezAccounts().people(raw);

        result = {
          ...user,
          password: undefined,
        };
      });

      if (documents && documents.data) {
        const documentsBase64 = await extractImagesFromJson(
          documents.data,
          wallet.id,
        );

        for (const item of documentsBase64) {
          await api.post(
            `/baas/api/v1/customers/${result.document}/documents`,
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
      return result;
    } catch (error: any) {
      console.log(error);

      throw error;
    }
  }
}

const mapEducationLevelToTranslation = (educationLevel: string): string => {
  const educationLevelTranslationMap: { [key: string]: string } = {
    Analfabeto: "ILLITERATE",
    "Ensino Fundamental - Anos Iniciais (1 a 4 anos)": "ELEMENTARY_1_TO_4_YEAR",
    "Ensino Fundamental - 5º ano": "ELEMENTARY_5_YEAR",
    "Ensino Fundamental - 6º a 9º ano": "ELEMENTARY_6_TO_4_YEAR",
    "Ensino Fundamental Completo": "COMPLETE_ELEMENTARY",
    "Ensino Médio Incompleto": "INCOMPLETE_HIGH_SCHOOL",
    "Ensino Médio Completo": "COMPLETE_HIGH_SCHOOL",
    "Ensino Superior Incompleto": "INCOMPLETE_HIGHER",
    "Ensino Superior Completo": "COMPLETE_HIGHER",
    "Pós-Graduação": "POSTGRADUATE",
    Mestrado: "MASTER_DEGREE",
    Doutorado: "DOCTORATE_DEGREE",
    // Adicione mais mapeamentos conforme necessário
  };
  const translatedEducationLevel =
    educationLevelTranslationMap[educationLevel] || educationLevel;

  // Adicione um console.log para imprimir o mapeamento
  console.log(
    `Nível de educação original: ${educationLevel}, Nível de educação traduzido: ${translatedEducationLevel}`,
  );

  return translatedEducationLevel;
};

const mapMaritalStatusToTranslation = (status: string): string => {
  const maritalStatusTranslationMap: { [key: string]: string } = {
    "Solteiro(a)": "SINGLE",
    "Casado(a)": "MARRIED",
    "Separado(a) Legalmente": "LEGALLY_SEPARATED",
    "Divorciado(a)": "DIVORCED",
    "União Estável": "STABLE_UNION",
    "Desimpedido(a)": "DETACHED",
    "Viúvo(a)": "WIDOWER",
    Outros: "OTHERS",
    // Adicione mais mapeamentos conforme necessário
  };
  return maritalStatusTranslationMap[status] || status;
};
