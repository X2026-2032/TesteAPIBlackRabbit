import { prisma } from "@/lib/prisma";
import { AppError } from "../errors/app-error";
import calculateAmountWithTax from "@/utils/calculateAmountWithTax";
import { User } from "@prisma/client";
import { IdezBankTransfersService } from "@/service/idez/bank-transfers";

export enum TaxNames {
  ABERTURA_DE_CONTAS = "ABERTURA DE CONTAS",
  ANUIDADE_DO_CARTÃO = "ANUIDADE DO CARTÃO",
  APLICAÇÃO_AUTOMÁTICA = "APLICAÇÃO AUTOMÁTICA",
  CARTÃO_VIRTUAL = "CARTÃO VIRTUAL",
  EMISSÃO_DE_BOLETO = "EMISSÃO DE BOLETO",
  EMISSÃO_DE_CARTÕES_FÍSICOS_ADICIONAIS = "EMISSÃO DE CARTÕES FÍSICOS ADICIONAIS",
  EMISSÃO_DO_1º_CARTÃO_FÍSICO = "EMISSÃO DO 1º CARTÃO FÍSICO",
  ENCERRAMENTO_DE_CONTAS = "ENCERRAMENTO DE CONTAS",
  GESTÃO_DE_COBRANÇA = "GESTÃO DE COBRANÇA",
  MANUTENÇÃO_DE_CONTAS = "MANUTENÇÃO DE CONTAS",
  PAGAMENTO_DE_CONTAS = "PAGAMENTO DE CONTAS",
  PLANOS = "PLANOS",
  RECEBIMENTO_VIA_CARTÃO = "RECEBIMENTO VIA CARTÃO",
  RECEBIMENTO_VIA_TED = "RECEBIMENTO VIA TED",
  SAQUE = "SAQUE",
  TRANSFERÊNCIA_PIX_CHECKIN = "TRANSFERÊNCIA PIX CHECKIN",
  TRANSFERÊNCIA_PIX_CHECKOUT = "TRANSFERÊNCIA PIX CHECKOUT",
  TRANSFERÊNCIAS_BANCÁRIAS = "TRANSFERÊNCIAS BANCÁRIAS",
  TRANSFERÊNCIA_ENTRE_WALLET = "TRANSFERÊNCIA ENTRE WALLET",
}

export type TaxNameType =
  | "ABERTURA_DE_CONTAS"
  | "ANUIDADE_DO_CARTÃO"
  | "APLICAÇÃO_AUTOMÁTICA"
  | "CARTÃO_VIRTUAL"
  | "EMISSÃO_DE_BOLETO"
  | "EMISSÃO_DE_CARTÕES_FÍSICOS_ADICIONAIS"
  | "EMISSÃO_DO_1º_CARTÃO_FÍSICO"
  | "ENCERRAMENTO_DE_CONTAS"
  | "GESTÃO_DE_COBRANÇA"
  | "MANUTENÇÃO_DE_CONTAS"
  | "PAGAMENTO_DE_CONTAS"
  | "PLANOS"
  | "RECEBIMENTO_VIA_CARTÃO"
  | "RECEBIMENTO_VIA_TED"
  | "SAQUE"
  | "TRANSFERÊNCIA_PIX_CHECKIN"
  | "TRANSFERÊNCIA_PIX_CHECKOUT"
  | "TRANSFERÊNCIA ENTRE WALLET"
  | "TRANSFERÊNCIAS_BANCÁRIAS";

type ExecuteProps = {
  account_id: string;
  transactionAmmount: number;
  taxType: TaxNames;
  transactionId?: string;
  number_of_transactions: number;
  createdAt?: string | Date;
};

export class PerformTaxUseCase {
  static async execute(data: ExecuteProps) {
    const tax = await prisma.taxConfiguration.findUnique({
      where: { name: data.taxType },
    });
    const account = await prisma.account.findFirst({
      where: { id: data.account_id },
    });
    const graphic = await prisma.graphicAccount.findFirst({
      where: { id: data.account_id },
    });

    if (!tax) throw new AppError({ message: "Tax configuration not found" });

    if (!account && !graphic)
      throw new AppError({ message: "no accounts found" });

    let user: User | undefined | null;

    user = await prisma.user.findUnique({
      where: { id: account?.user_id || "" },
    });

    if (user && user.role == "MASTER") return;

    const calculatedTax = calculateAmountWithTax(tax, data.transactionAmmount);

    console.log("\n Calculated tax", calculatedTax);
    if (tax.name == TaxNames.TRANSFERÊNCIA_PIX_CHECKIN) {
      if (data.transactionAmmount <= calculatedTax.taxTotal) {
        console.log("\n TRANSACAO NAO COBRE TAXA...");
        return;
      }
      console.log("\n TRANSACAO COBRE A TAXA...");
    } else {
      if (graphic && graphic.balance < calculatedTax.taxTotal) {
        throw new AppError({ message: "Saldo insuficiente", status: 401 });
      }

      if (account && account.balance! < calculatedTax.taxTotal) {
        throw new AppError({ message: "Saldo insuficiente", status: 401 });
      }
    }
    //criar role ADMIN_BAG pois pode existir mais de um admin mas, somente o adminbag recebe o dinheiro (adminbag é o bolsão)
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN_BAG" } });
    const master = await prisma.user.findFirst({ where: { role: "MASTER" } });

    const adminAccount = await prisma.account.findFirst({
      where: { user_id: admin?.id },
    });

    console.log(adminAccount);
    const masterAccount = await prisma.account.findFirst({
      where: { user_id: master?.id },
    });

    await prisma.$transaction(async (tx) => {
      let adminTransactionResponse: any = null;
      let defaultTransactionResponse: any = null;

      if (user && (user.role == "ADMIN" || user.role == "ADMIN_BAG")) {
        const adminAccount = await tx.account.findFirst({
          where: { user_id: user.id },
        });
        console.log("\n role ADMIN");

        if (adminAccount) {
          console.log("\n adminAccount", adminAccount);

          let account5DigitsAdmin;

          //valida a existencia de account_number e account_digit pra nao gerar erro
          if (masterAccount?.account_number && masterAccount.account_digit) {
            account5DigitsAdmin = `${masterAccount.account_number}${masterAccount.account_digit}`;
          }

          if (!account5DigitsAdmin)
            throw new AppError({
              message: "5 digits account number is required for p2p transfer",
            });

          if (!adminAccount.api_key)
            throw new AppError({
              message: "Admin api_key is missing",
            });

          const masterReponse =
            await new IdezBankTransfersService().p2pTransfer(
              {
                amount: calculatedTax.taxDefault,
                beneficiaryAccount: account5DigitsAdmin,
              },
              adminAccount.api_key as string,
            );

          defaultTransactionResponse = masterReponse;

          const updatedAdminAccount = await tx.account.update({
            where: { id: adminAccount.id },
            data: {
              balance: adminAccount.balance! - calculatedTax.taxDefault,
            },
          });

          console.log(
            `-R$ ${calculatedTax.taxDefault.toFixed(2)} ADMIN_BAG -> MASTER`,
          );

          const taxTransaction = await tx.accountTransaction.create({
            data: {
              amount: calculatedTax.taxDefault,
              transaction_id: data.transactionId ? data.transactionId : "",
              type: "INTERNAL_TAX",
              data: masterReponse || {},
              direction: "out",
              status: "done",
              description: "Taxa por transação",
              newValue: updatedAdminAccount.balance!,
              previousValue: adminAccount.balance!,
              number_of_transaction: data.number_of_transactions,
              response: {
                beneficiary: master,
                payer: admin,
              } as any,
              created_at: data.createdAt ? data.createdAt : new Date(),
              account_id: adminAccount.id,
            },
          });

          await tx.reportBalance.create({
            data: {
              account_id: adminAccount.id,
              account_transaction_id: taxTransaction.id,
              description: "Taxa por transação",
              amount: updatedAdminAccount.balance!,
              created_at: data.createdAt ? data.createdAt : new Date(),
            },
          });

          return console.log("updatedAdminAccount", updatedAdminAccount);
        }
      }

      if (graphic) {
        console.log("graphic a taxa usuario role member");

        const graphic_api_key = graphic.virtual_account_id;

        if (!graphic_api_key)
          throw new AppError({ message: "Invalid graphic api_key" });

        if (admin && calculatedTax.tax > 0) {
          if (admin.api_key != graphic_api_key) {
            let account5DigitsAdmin;

            //valida a existencia de account_number e account_digit pra nao gerar erro
            if (adminAccount?.account_number && adminAccount.account_digit) {
              account5DigitsAdmin = `${adminAccount.account_number}${adminAccount.account_digit}`;
            }

            if (!account5DigitsAdmin)
              throw new AppError({
                message: "5 digits account number is required for p2p transfer",
              });

            if (!adminAccount?.api_key)
              throw new AppError({
                message: "Admin api_key is missing",
              });

            // const adminResponse =
            //   await new IdezBankTransfersService().p2pTransfer(
            //     {
            //       amount: calculatedTax.tax,
            //       beneficiaryAccount: account5DigitsAdmin,
            //     },
            //     graphic_api_key,
            //   );

            const updatedAdminAccount = await tx.account.update({
              where: { id: adminAccount?.id },
              data: {
                balance: adminAccount?.balance! + calculatedTax.tax,
              },
            });

            const taxTransaction = await tx.accountTransaction.create({
              data: {
                number_of_transaction: data.number_of_transactions,
                amount: calculatedTax.tax,
                type: "INTERNAL_TAX",
                transaction_id: data.transactionId,
                data: adminResponse || {},
                direction: "in",
                status: "done",
                description: "Taxa por transação",
                newValue: updatedAdminAccount.balance!,
                previousValue: adminAccount.balance!,
                response: {
                  payer: { ...admin, password: undefined },
                  beneficiary: { ...graphic, password_hash: undefined },
                } as any,
                account_id: adminAccount.id,
                created_at: data.createdAt ? data.createdAt : new Date(),
              },
            });

            await tx.reportBalance.create({
              data: {
                account_id: adminAccount.id,
                account_transaction_id: taxTransaction.id,
                description: "Taxa por transação",
                amount: updatedAdminAccount.balance!,
                created_at: data.createdAt ? data.createdAt : new Date(),
              },
            });

            adminTransactionResponse = adminResponse;
          }

          const updatedGraphic = await tx.graphicAccount.update({
            where: { id: graphic.id },
            data: {
              balance: graphic.balance - calculatedTax.tax,
            },
          });
          const graphicTransaction = await tx.graphicAccountTransaction.create({
            data: {
              amount: calculatedTax.tax,
              transaction_id: data.transactionId,
              type: "INTERNAL_TAX",
              data: adminTransactionResponse || {},
              direction: "out",
              status: "done",
              description: "Taxa por transação",
              newValue: updatedGraphic.balance!,
              previousValue: graphic.balance!,
              response: {
                beneficiary: { ...admin, password: undefined },
                payer: { ...updatedGraphic, password_hash: undefined },
              } as any,
              graphic_account_id: updatedGraphic.id,
              created_at: data.createdAt ? data.createdAt : new Date(),
              number_of_transaction: data.number_of_transactions,
            },
          });
          await tx.reportBalance.create({
            data: {
              graphic_account_id: graphic.id,
              graphic_transaction_id: graphicTransaction.id,
              description: "Taxa por transação",
              amount: updatedGraphic.balance,
              created_at: data.createdAt ? data.createdAt : new Date(),
            },
          });
        }

        if (master && calculatedTax.taxDefault > 0) {
          if (master.api_key != graphic_api_key) {
            let account5DigitsAdmin;

            //valida a existencia de account_number e account_digit pra nao gerar erro
            if (masterAccount?.account_number && masterAccount.account_digit) {
              account5DigitsAdmin = `${masterAccount.account_number}${masterAccount.account_digit}`;
            }

            if (!account5DigitsAdmin)
              throw new AppError({
                message: "5 digits account number is required for p2p transfer",
              });

            if (!masterAccount?.api_key)
              throw new AppError({
                message: "Master api_key is missing",
              });

            const masterReponse =
              await new IdezBankTransfersService().p2pTransfer(
                {
                  amount: calculatedTax.taxDefault,
                  beneficiaryAccount: account5DigitsAdmin,
                },
                graphic_api_key,
              );

            const updatedMasterAccount = await tx.account.update({
              where: { id: masterAccount?.id },
              data: {
                balance: masterAccount?.balance! + calculatedTax.taxDefault,
              },
            });

            const taxTransaction = await tx.accountTransaction.create({
              data: {
                number_of_transaction: data.number_of_transactions,
                amount: calculatedTax.taxDefault,
                transaction_id: data.transactionId,
                type: "INTERNAL_TAX",
                data: masterReponse || {},
                direction: "in",
                status: "done",
                description: "Taxa por transação",
                newValue: updatedMasterAccount.balance!,
                previousValue: masterAccount.balance!,
                response: {
                  payer: { ...master, password: undefined },
                  beneficiary: { ...graphic, password_hash: undefined },
                } as any,
                account_id: masterAccount.id,
                created_at: data.createdAt ? data.createdAt : new Date(),
              },
            });

            await tx.reportBalance.create({
              data: {
                amount: updatedMasterAccount.balance!,
                account_id: masterAccount?.id,
                account_transaction_id: taxTransaction.id,
                description: "Taxa por transação",
                created_at: data.createdAt ? data.createdAt : new Date(),
              },
            });

            defaultTransactionResponse = masterReponse;
          }
          const updatedGraphicAccount = await tx.graphicAccount.update({
            where: { id: graphic.id },
            data: {
              balance: graphic.balance - calculatedTax.taxDefault,
            },
          });

          const graphicTransaction = await tx.graphicAccountTransaction.create({
            data: {
              amount: calculatedTax.taxDefault,
              transaction_id: data.transactionId,
              type: "INTERNAL_TAX",
              data: defaultTransactionResponse || {},
              direction: "out",
              status: "done",
              description: "Taxa por transação",
              newValue: updatedGraphicAccount.balance!,
              previousValue: graphic.balance!,
              response: {
                beneficiary: { ...master, password: undefined },
                payer: { ...updatedGraphicAccount, password_hash: undefined },
              } as any,
              graphic_account_id: updatedGraphicAccount.id,
              created_at: data.createdAt ? data.createdAt : new Date(),
              number_of_transaction: data.number_of_transactions,
            },
          });

          await tx.reportBalance.create({
            data: {
              amount: updatedGraphicAccount.balance,
              graphic_account_id: graphic.id,
              graphic_transaction_id: graphicTransaction.id,
              description: "Taxa por transação",
              created_at: data.createdAt ? data.createdAt : new Date(),
            },
          });
        }
        return;
      }

      // transfere a taxa usuario role member
      if (account && account.balance) {
        const api_key = account.api_key;

        if (!api_key) throw new AppError({ message: "Invalid api_key" });

        let adminTransactionResponse = null;
        let defaultTransactionResponse = null;

        if (admin) {
          let account5DigitsAdmin;

          //valida a existencia de account_number e account_digit pra nao gerar erro
          if (adminAccount?.account_number && adminAccount.account_digit) {
            account5DigitsAdmin = `${adminAccount.account_number}${adminAccount.account_digit}`;
          }

          if (!account5DigitsAdmin)
            throw new AppError({
              message: "5 digits account number is required for p2p transfer",
            });

          if (!admin?.api_key)
            throw new AppError({
              message: "Admin api_key is missing",
            });

          const adminResponse =
            await new IdezBankTransfersService().p2pTransfer(
              {
                amount: calculatedTax.tax,
                beneficiaryAccount: account5DigitsAdmin,
              },
              api_key,
            );
          adminTransactionResponse = adminResponse;
        }

        //taxa pra admin bag tirando da conta member
        const updatedMember = await tx.account.update({
          where: { id: account.id },
          data: {
            balance: account.balance - calculatedTax.tax,
          },
        });

        const taxTransaction = await tx.accountTransaction.create({
          data: {
            number_of_transaction: data.number_of_transactions,
            amount: calculatedTax.tax,
            transaction_id: data.transactionId,
            type: "INTERNAL_TAX",
            data: adminTransactionResponse || {},
            direction: "out",
            status: "done",
            description: "Taxa por transação",
            newValue: updatedMember.balance!,
            previousValue: account.balance!,
            response: {
              payer: { ...user, password: undefined },
              beneficiary: { ...admin, password: undefined },
            } as any,
            account_id: updatedMember.id,
            created_at: data.createdAt ? data.createdAt : new Date(),
          },
        });

        await tx.reportBalance.create({
          data: {
            account_transaction_id: taxTransaction.id,
            description: "Taxa por transação",
            amount: updatedMember.balance!,
            account_id: account.id,
            created_at: data.createdAt ? data.createdAt : new Date(),
          },
        });

        if (master) {
          let account5DigitsAdmin;

          //valida a existencia de account_number e account_digit pra nao gerar erro
          if (masterAccount?.account_number && masterAccount.account_digit) {
            account5DigitsAdmin = `${masterAccount.account_number}${masterAccount.account_digit}`;
          }

          if (!account5DigitsAdmin)
            throw new AppError({
              message: "5 digits account number is required for p2p transfer",
            });

          if (!masterAccount?.api_key)
            throw new AppError({
              message: "Master api_key is missing",
            });

          const masterReponse =
            await new IdezBankTransfersService().p2pTransfer(
              {
                amount: calculatedTax.taxDefault,
                beneficiaryAccount: account5DigitsAdmin,
              },
              api_key,
            );
          defaultTransactionResponse = masterReponse;
        }

        const lastUpdatedMember = await tx.account.update({
          where: { id: account.id },
          data: {
            balance: account.balance - calculatedTax.taxDefault,
          },
        });

        const transaction = await tx.accountTransaction.create({
          data: {
            number_of_transaction: data.number_of_transactions,
            amount: calculatedTax.taxDefault,
            transaction_id: data.transactionId,
            type: "INTERNAL_TAX",
            data: adminTransactionResponse || {},
            direction: "out",
            status: "done",
            description: "Taxa por transação",
            newValue: lastUpdatedMember.balance!,
            previousValue: updatedMember.balance!,
            response: {
              payer: { ...user, password: undefined },
              beneficiary: { ...master, password: undefined },
            } as any,
            account_id: updatedMember.id,
            created_at: data.createdAt ? data.createdAt : new Date(),
            Account: {
              connect: {
                id: updatedMember.id,
              },
            },
          },
        });

        await tx.reportBalance.create({
          data: {
            account_transaction_id: transaction.id,
            description: "Taxa por transação",
            amount: lastUpdatedMember.balance!,
            account_id: account.id,
            created_at: data.createdAt ? data.createdAt : new Date(),
          },
        });
      }
    });
  }
}
