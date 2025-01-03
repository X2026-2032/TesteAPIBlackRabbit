import { api, requestError } from "@/lib/axios";
import { BankSlipRepository } from "@/repositories/bank-slip-repository";
import { PayerRepository } from "@/repositories/payer-repository";
import { UsersRepository } from "@/repositories/users-respository";
import { BankSlip, ChargeType, Prisma } from "@prisma/client";
import { AppError } from "../errors/app-error";
import { prisma } from "@/lib/prisma";
import { IdezBankSlipsService } from "@/service/idez/bank-slips";
import { CreateTransactionUseCase } from "../transactions/create-transactions";
import { GetUsersAccountToken } from "../get-users-account-token";
import { UpdateTransactionsUseCase } from "../transactions/update-transactions";
import generateIdempotencyKey from "@/utils/generateIdempotencyKey";
import generateUUID from "@/utils/generateUUID";
import { v4 as uuidv4 } from "uuid";
import generateRandomNumber from "@/utils/generateRandomNumber";
import moment from "moment";

interface CreateBankSlipUseCaseRequest {
  userId: string;
  data: any;
}

export class CreateBankSlipUseCase {
  constructor(
    private repository: BankSlipRepository,
    private payerRepository: PayerRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({ userId, data }: CreateBankSlipUseCaseRequest) {
    const buildBankSlips = {
      data,
      direction: "in",
      status: "PENDING",
      type: "bank_slips",
      amount: data.amount,
      description: data.payer.name,
    };

    const tx = await new CreateTransactionUseCase().execute(
      buildBankSlips,
      userId,
    );

    const bankSlip = null;

    let createdBankSlip: BankSlip | null = null;

    if (tx && !tx.graphic) {
      const token = await GetUsersAccountToken.execute(userId);
      if (!token) throw new Error("Usuário inválido");

      const user = await prisma.user.findFirst({ where: { id: userId } });
      const graphic = await prisma.graphicAccount.findFirst({
        where: { id: userId },
      });

      const someApiKey = user?.api_key || graphic?.virtual_account_id;

      if (!someApiKey)
        throw new AppError({ message: "ApiKey is required for this action." });

      try {
        // Verificar se é recorrente
        if (data.recurrence) {
          const uuid = uuidv4();
          const bankSlipsToCreate = []; // Array para armazenar os dados dos boletos

          for (let i = 0; i < data.quantityInstallments; i++) {
            const correlationId = uuidv4();
            const yourNumber = generateRandomNumber();

            // Crie uma nova instância de data para cada item
            const currentDueDate = moment(data.dueDate).toDate();
            const newDueDate = moment(currentDueDate).add(i, "months");

            const bankSlipData = {
              ...data,
              correlationId,
              yourNumber,
              dueDate: newDueDate.format("YYYY-MM-DD"),
              installment_number: i + 1,
            };

            bankSlipsToCreate.push(bankSlipData);
          }

          const promises = bankSlipsToCreate.map(async (bankSlipData) => {
            const bankSlip = await new IdezBankSlipsService().execute(
              bankSlipData,
              someApiKey,
            );
            console.log(bankSlipData);
            const createdBankSlip = await prisma.bankSlip.create({
              data: {
                amount: bankSlipData.amount,
                charge_type: bankSlipData.type,
                barcode: bankSlipData.barCode,
                digitable_line: bankSlipData.digitableLine,
                correlationId: bankSlipData.correlationId,
                due_date: new Date(bankSlipData.dueDate),
                qrcode64: bankSlipData.qrCodeImageBase64,
                instructions: "",
                reference_id: userId,
                reference_id_tx: bankSlipData.correlationId,
                status: "OPEN",
                recurrence: bankSlipData.recurrence,
                quantity_installments: bankSlipData.quantityInstallments,
                installment_number: bankSlipData.installment_number,
                data: { ...bankSlip, beneficiary: user || graphic },
              },
            });

            await new UpdateTransactionsUseCase().execute(
              { ...bankSlip },
              tx.transation.id,
              false,
              "PENDING",
            );
          });

          await Promise.all(promises);
        } else {
          // Se não for recorrente, criar apenas um boleto
          const bankSlip = await new IdezBankSlipsService().execute(
            {
              ...data,
              correlationId: uuidv4(),
              yourNumber: generateRandomNumber(),
            },
            someApiKey,
          );

          // Criar o boleto no banco de dados
          createdBankSlip = await prisma.bankSlip.create({
            data: {
              amount: bankSlip.amount,
              charge_type: bankSlip.type,
              barcode: bankSlip.barCode,
              digitable_line: bankSlip.digitableLine,
              correlationId: bankSlip.correlationId,
              due_date: bankSlip.dueDate,
              qrcode64: bankSlip.qrCodeImageBase64,
              instructions: "",
              reference_id: userId,
              status: "OPEN",
              data: { ...bankSlip, beneficiary: user || graphic },
            },
          });

          // Atualizar o estado da transação para PENDING
          await new UpdateTransactionsUseCase().execute(
            { ...bankSlip },
            tx.transation.id,
            false,
            "PENDING",
          );
        }
      } catch (error) {
        // Em caso de erro, atualizar o estado da transação para error
        await new UpdateTransactionsUseCase().execute(
          undefined as any,
          tx.transation.id,
          false,
          "error",
        );
        throw error;
      }
    }

    return { ...tx, data: bankSlip, createdBankSlip };
  }

  // private makeBankSlipToPersist(data: any): Prisma.BankSlipCreateInput {
  //   function getTaxType(aType: "percentual" | "fixed_amount") {
  //     const taxMapper = {
  //       fixed_amount: TaxType.FIXED_AMOUNT,
  //       percentual: TaxType.PERCENTUAL,
  //     };

  //     return taxMapper[aType];
  //   }

  //   let fine = {};
  //   let discount = {};
  //   let interest = {};

  //   if (data.fine) {
  //     fine = {
  //       kind: TaxKind.FINE,
  //       type: getTaxType(data.fine.type),
  //       amount: data.fine.amount,
  //       date: new Date(data.fine.date),
  //     };
  //   }

  //   if (data.interest) {
  //     interest = {
  //       kind: TaxKind.INTEREST,
  //       type: getTaxType(data.interest.type),
  //       amount: data.interest.amount,
  //       date: new Date(data.interest.date),
  //     };
  //   }

  //   if (data.discount) {
  //     discount = {
  //       kind: TaxKind.DISCOUNT,
  //       type: TaxType.UNTIL_DATE,
  //       amount: data.discount.amount,
  //       date: new Date(data.discount.date),
  //     };
  //   }

  //   const tax = [fine, interest, discount].filter((t) => JSON.stringify(t) !== "{}") as any;

  //   return {
  //     type: data.type,
  //     charge_type: getChargeType(data.charge_type),
  //     due_date: new Date(data.due_date),
  //     // limit_date: getLimitDate(data.limit_date as 30 | 60 | 90),
  //     amount: data.amount,
  //     instructions: data.instructions,
  //     reference_id: data.referenceId,
  //     barcode: data.barcode,
  //     digitable_line: data.digitable_line,
  //     Tax: {
  //       createMany: {
  //         data: tax,
  //       },
  //     },
  //   };

  //   function getLimitDate(time: 30 | 60 | 90) {
  //     const limitDateMapper = {
  //       30: LimitDate.D30,
  //       60: LimitDate.D60,
  //       90: LimitDate.D90,
  //     };

  //     return limitDateMapper[time] as LimitDate;
  //   }

  //   function getChargeType(type: "BANKSLIP" | "BANKSLIP_PIX") {
  //     const chargeTypeMapper = {
  //       product: ChargeType.BANKSLIP,
  //       service: ChargeType.,
  //     };

  //     return chargeTypeMapper[type] as ChargeType;
  //   }
  // }

  private makePayerToPersist(data: any, blankSlipId: string) {
    return {
      name: data.name,
      document: data.document,
      bankSlip: { connect: { id: blankSlipId } },
      address: {
        create: {
          street: data.address.street,
          number: data.address.number,
          neighborhood: data.address.neighborhood,
          city: data.address.city,
          state: data.address.state,
          postal_code: data.address.postal_code,
          extra: data.address.extra,
        },
      },
    };
  }
}

export class CreateBankSlipsProcessUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  public async execute(userId: string, data: any) {
    const users = await this.usersRepository.findById(userId);
    if (!users) throw new Error("Usuário não encontrado");

    const response = await new IdezBankSlipsService().execute(
      data,
      users.access_token!,
    );
    return { bank_slips: response } as any;
  }
}

export { BankSlip };
