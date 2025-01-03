import { CreateTransactionUseCase } from "../transactions/create-transactions";
import { GetUsersAccountToken } from "../get-users-account-token";
import { IdezBankTransfersService } from "@/service/idez/bank-transfers";
import { IdezPhoneRechargesService } from "@/service/idez/phone-recharges";
import { IdezPixService } from "@/service/idez/pix";
import { prisma } from "@/lib/prisma";
import { AppError } from "../errors/app-error";
import { GraphicAccount } from "@prisma/client";
import { PerformTaxUseCase, TaxNames } from "../tax/performTax";
import { sendExtractImageToEmail } from "@/utils/makeExtractPDF";

export class ApprovedGrapicAccountTransactionsUseCase {
  public async execute(
    userId: string,
    data: {
      data: string[];
      graphic_account_id?: string;
    },
  ) {
    const token = await GetUsersAccountToken.execute(userId);
    if (!token) throw new Error("Usuário inválido");

    console.log("data data data", data);

    let someApiKey = null;
    let graphicAccount: GraphicAccount | null = null;

    if (data.graphic_account_id) {
      const ga = await prisma.graphicAccount.findFirst({
        where: { id: data.graphic_account_id },
      });

      if (ga) {
        console.log("TEM GRAPHIC", ga);

        someApiKey = ga.virtual_account_id;
        graphicAccount = ga;
      }
    } else {
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });

      console.log("API DO USER", user?.api_key);

      if (user) someApiKey = user.api_key;
    }

    console.log(data.data);

    if (!graphicAccount)
      throw new AppError({ message: "Graphic Account nao encontrado" });
    if (!someApiKey)
      throw new AppError({ message: "ApiKey é necessaria para essa ação" });

    const transactions = await prisma.graphicAccountTransaction.findMany({
      where: {
        graphic_account_id: graphicAccount.id,
        status: "waiting",
        id: { in: data.data },
      },
    });

    console.log("TRANSACOES DA CONTA ", graphicAccount.name, transactions);

    // const graphicAccountBalance: Record<string, number> = {};

    // if (data.graphic_account) {

    //   for (let i = 0; i < data.data.length; i++) {
    //     const id = data.data[i];
    //     graphicAccountBalance[id] = 0;
    //   }
    // } else {
    //   graphicAccountBalance[data.graphic_account_id!] = 0;
    // }

    // const transactions: GraphicAccountTransaction[] = [];

    // for (let id of data.data) {
    //   const _ga_tx = await prisma.graphicAccountTransaction.findUnique({
    //     where: {
    //       id,
    //     },
    //   });
    //   if (_ga_tx && _ga_tx.status == "waiting") transactions.push(_ga_tx);
    // }

    // console.log("transactions transactions transactions transactions", transactions);

    // if (!transactions) throw new AppError({ message: "Transações não encontradas" });

    const factory: Record<string, any> = {
      pix: new IdezPixService().transfers,
      ted: new IdezBankTransfersService().transfers,
      payment: new CreateTransactionUseCase().execute,
      phone_recharges: new IdezPhoneRechargesService().confirm,
      p2p_transfer: new IdezBankTransfersService().p2pTransfer,
    };

    // const process: Record<string, any> = {};

    for (const transaction of transactions) {
      try {
        if (transaction.type == "pix") {
          if (!transaction.endToEndPix)
            throw new AppError({
              message: "Transacao faltando endToEndPix...",
            });

          // const p2pTransaction = await prisma.graphicAccountTransaction.findFirst({
          //   where: { endToEndPix: transaction.endToEndPix, type: "p2p_transfer" },
          // });

          const pixResponse = await new IdezPixService().transfers(
            {
              amount: transaction.amount,
              endToEndId: transaction.endToEndPix,
              initiationType: "KEY",
              description: `Aprovando pix para: ${transaction.id}`,
            },
            someApiKey,
          );

          if (pixResponse) {
            const tx = await prisma.graphicAccountTransaction.update({
              where: { id: transaction.id },
              data: { status: "done", response: pixResponse },
            });

            await PerformTaxUseCase.execute({
              account_id: graphicAccount.id,
              taxType: TaxNames.TRANSFERÊNCIA_PIX_CHECKOUT,
              transactionAmmount: transaction.amount,
              number_of_transactions: tx.number_of_transaction!,
              createdAt: tx.created_at,
            });

            sendExtractImageToEmail({
              name: graphicAccount.name,
              to: graphicAccount.email,
              transactionId: tx.id,
            });
          }
        }
      } catch (error) {
        console.log("erro na aprovacao: ", error);
      }

      return;
      // const { id, ...transaction } = transactions[i];
      // process[id] = {
      //   process: "waiting",
      //   response: undefined,
      //   amount: transaction.amount,
      //   direction: transaction.direction,
      //   graphic_account_id: transaction.graphic_account_id,
      // };
      // try {
      //   //@ts-ignore
      //   // const eTed = transaction.type === "ted";
      //   let build = {};
      //   if (transaction.type == "pix") {
      //     build = {
      //       // id_tx: id,
      //       endToEndId: transactions[i].endToEndPix,
      //       description: "Transacao aprovada pelo usuario master",
      //       amount: transactions[i].amount,
      //       initiationType: "KEY",
      //     };
      //   }
      //   if (transaction.type == "p2p_transfer") {
      //     const externalId = generateIdempotencyKey()
      //     build = {
      //       externalId,
      //       description: "Transacao P2P aprovada pelo usuario master",
      //       amount: transactions[i].amount,
      //       // beneficiaryAccount:
      //     };
      //   }
      //   console.log("transaction.typetransaction.typetransaction.type", transaction.type);
      //   const response = await factory[transaction.type](, someApiKey);
      //   console.log("RESPONSE DA APROVACAO PIX", response);
      //   process[id].process = "done";
      //   process[id].response = response;
      // } catch (error) {
      //   console.log("ERRO NA APROVACAO DO PIX", error);
      //   process[id] = {
      //     ...process[id],
      //     process: "error",
      //     response: {
      //       data: error.data,
      //       message: error.message,
      //     },
      //   };
      // }
    }

    // const updateTransactions = Object.entries(process).reduce((acc, item) => {
    //   console.log({ item });
    //   const [id, data] = item;

    //   acc.push({
    //     id,
    //     status: data.process,
    //     response: data.response,
    //   });
    //   if (data.direction === "out" && data.process === "error") {
    //     graphicAccountBalance[data.graphic_account_id] += data.amount;
    //   }
    //   return acc;
    // }, [] as any);

    // await prisma.$transaction(async (tx) => {
    //   for (let id of Object.keys(graphicAccountBalance)) {
    //     const balance = graphicAccountBalance[id];
    //     if (balance > 0) {
    //       const account = await tx.graphicAccount.findUnique({
    //         where: {
    //           id,
    //         },
    //       });
    //       await tx.graphicAccount.update({
    //         where: {
    //           id,
    //         },
    //         data: {
    //           balance: account!.balance + balance,
    //         },
    //       });
    //     }
    //   }
    //   for (let i = 0; i < updateTransactions.length; i++) {
    //     const transaction = updateTransactions[i];
    //     await tx.graphicAccountTransaction.update({
    //       where: {
    //         id: transaction.id,
    //       },
    //       data: {
    //         ...transaction,
    //         id: undefined,
    //       },
    //     });
    //   }
    // });
  }
}
