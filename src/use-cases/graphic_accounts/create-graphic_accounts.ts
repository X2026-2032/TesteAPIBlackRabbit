import { UsersRepository } from "@/repositories/users-respository";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { AccountsRepository } from "@/repositories/accounts-repository";
import { Role } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { api } from "@/lib/axios";
import { AppError } from "../errors/app-error";

interface CreateGrapicAccountUseCaseRequest {
  userId: string | undefined | null;
  document: string;
  email?: string;
  name: string;
  type?: string;
  isPoliticallyExposedPerson?: boolean;
  amountMonthlyInvoicing?: number;
  activityCnae?: string;
  openingDate?: string;
  amountPatrimony?: number;
  amountShareCapital?: number;
  corporateName?: string;
  fantasyName?: string;
  partners?: {
    is_pep?: boolean;
    name?: string;
    document?: string;
    birthDate?: string;
    mother_name?: string;
    phone?: {
      ddd?: string;
      number?: string;
      type?: string;
    };
    address?: {
      state: string; //only the UF code
      publicPlace: string;
      number: string;
      zipCode: string; //only numbers
      neighborhood: string;
      complement?: string;
      isConfirmed: boolean;
      type: string;
      cityId?: number;
      cityName?: string;
    };
  };
  password: string;
  number_identifier?: string;
  passwordEletronic: string;
  blocked: boolean;
  counter: number;
  educationLevel?: string;
  maritalStatus?: string;
  monthlyInvoicing?: string;
  role: string;
  gender?: string;
  birthDate?: string;
  rg_cnh?: string | null;
  planId?: string;
  pin: string;
  phone?: {
    ddd: string;
    number: string;
    type: string;
  };
  address?: {
    state: string; //only the UF code
    publicPlace: string;
    number: string;
    zipCode: string; //only numbers
    neighborhood: string;
    complement?: string;
    isConfirmed: boolean;
    type: string;
    cityId?: number;
    cityName?: string;
  };
}

// Function to generate the unique identifier
export const generateUniqueIdentifier = (): string => {
  const fixedPrefix = Math.floor(100000 + Math.random() * 90000000).toString();

  return `${fixedPrefix}-${7}`;
};

export class CreateGrapicAccountUseCase {
  private readonly usersRepository: UsersRepository;
  private readonly accountsRepository: AccountsRepository;

  constructor(
    usersRepository: UsersRepository,
    accountsRepository: AccountsRepository,
  ) {
    this.usersRepository = usersRepository;
    this.accountsRepository = accountsRepository;
  }

  public async execute({
    userId,
    name,
    document,
    email,
    password,
    passwordEletronic,
    counter,
    blocked,
    role,
    gender,
    birthDate,
    rg_cnh,
    address,
    planId,
    number_identifier,
    pin,
    phone,
    educationLevel,
    maritalStatus,
    monthlyInvoicing,
    activityCnae,
    amountMonthlyInvoicing,
    amountPatrimony,
    amountShareCapital,
    corporateName,
    fantasyName,
    isPoliticallyExposedPerson,
    openingDate,
    partners,
    type,
  }: CreateGrapicAccountUseCaseRequest) {
    if (number_identifier) {
      const existingGraphicAccount = await prisma.graphicAccount.findFirst({
        where: {
          OR: [
            { number_identifier: number_identifier }, // Verificar se o número identificador já existe.
            { document: document }, // Adicione outras condições de verificação se necessário.
          ],
        },
      });

      if (existingGraphicAccount) {
        number_identifier = generateUniqueIdentifier(); // Gere um novo número identificador único se o atual já existir.
        // Realize outras operações ou tratamentos necessários aqui, se necessário.
      }
    }

    const users = await prisma.user.findFirst({
      where: {
        document,
      },
    });

    if (users) {
      throw new Error("CPF/CNPJ já cadastrado");
    }

    const account = await this.accountsRepository.findByUserId(
      userId as string,
    );

    if (!account) {
      throw new Error("Conta não encontrada");
    }

    const isGraphicAccount = await prisma.graphicAccount.findFirst({
      where: {
        email,
        document,
      },
    });

    if (isGraphicAccount) {
      throw new Error("Conta já cadastrada para este documento.");
    }

    const identifierStatus = role === "GRAPHIC" ? Role.GRAPHIC : Role.WALLET;

    const isWalletId =
      role === "WALLET"
        ? (process.env.ADMIN_BAG_ACCOUNT_ID as string)
        : account.id;

    const { id, bank_account_id } = await this.requestCreateVirtualAccount();

    if (type === "PF") {
      const graphicAccount = await prisma.graphicAccount.create({
        data: {
          name,
          email: email!,
          rg_cnh: role === "WALLET" ? rg_cnh : "",
          document,
          balance: 0,
          status: role === "WALLET" ? "under_review" : "active",
          user_id: userId as string,
          account_id: isWalletId,
          password_hash: await hash(password, 6),
          number_identifier: generateUniqueIdentifier(),
          pin,
          phone,
          security_eletronic: passwordEletronic,
          counter,
          blocked,
          virtual_account_id: id,
          bank_account_id,
          role: identifierStatus,
          franchise_id: account.franchise_id,
          terms: { isChecked: true, createdAt: new Date() },
          gender: gender || undefined,
          birthDate: birthDate || undefined,
          educationLevel,
          maritalStatus,
          monthlyInvoicing,
          planId: planId || undefined,
          userType: "PF",
        },
      });

      if (address && graphicAccount.role == "WALLET") {
        const newAddress = await prisma.address.create({
          data: { ...address, graphicId: graphicAccount.id },
        });
      }

      await prisma.feeLimits.create({
        data: {
          GraphicAccount: { connect: { id: graphicAccount.id } },
        },
      });

      return { ...graphicAccount, password_hash: undefined };
    }

    if (type === "PJ") {
      const graphicAccount = await prisma.graphicAccount.create({
        data: {
          name,
          rg_cnh: role === "WALLET" ? rg_cnh : "",
          document,
          balance: 0,
          status: role === "WALLET" ? "under_review" : "active",
          user_id: userId as string,
          account_id: isWalletId,
          password_hash: await hash(password, 6),
          number_identifier: generateUniqueIdentifier(),
          virtual_account_id: id,
          bank_account_id,
          pin,
          phone,
          security_eletronic: passwordEletronic,
          counter,
          blocked,
          role: identifierStatus,
          franchise_id: account.franchise_id,
          terms: { isChecked: true, createdAt: new Date() },
          monthlyInvoicing,
          planId: planId || undefined,
          activityCnae,
          amountMonthlyInvoicing,
          amountPatrimony,
          amountShareCapital,
          corporateName,
          fantasyName,
          isPoliticallyExposedPerson,
          openingDate,
          userType: "PJ",
        },
      });

      if (address && graphicAccount.role == "WALLET") {
        const newAddress = await prisma.address.create({
          data: { ...address, graphicId: graphicAccount.id },
        });

        const partnerAddress = await prisma.address.create({
          data: { ...partners!.address!, graphicId: graphicAccount.id },
        });

        const partnerAccount = await prisma.partner.create({
          data: {
            birth_date: partners!.birthDate!,
            document: partners!.document!,
            mother_name: partners!.mother_name!,
            name: partners!.name!,
            user_id: graphicAccount.user_id,
            address_id: partnerAddress.id,
            partnerId: uuidv4(),
          },
        });
      }

      await prisma.feeLimits.create({
        data: {
          GraphicAccount: { connect: { id: graphicAccount.id } },
        },
      });

      return { ...graphicAccount, password_hash: undefined };
    }
  }

  private async requestCreateVirtualAccount(): Promise<any> {
    try {
      const response = await api.post(
        `/banking/virtual_accounts`,
        {
          bank_account_id: process.env.ADMIN_BAG_ACCOUNT_ID as string,
          description: "Conta Virtual",
        },
        {
          auth: {
            username: process.env.AUTH_USERNAME || "",
            password: process.env.AUTH_PASSWORD || "",
          },
        },
      );

      return response.data.data;
    } catch (error: any) {
      throw new AppError({
        message: "Não foi possível criar a conta virtual",
      });
    }
  }
}
