import axios from "axios";
import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import { parseString } from "xml2js";
import { WebHookPagBank } from "./interface/webhook.interface";
import {
  PagBankTransaction,
  PagPlans,
  TaxConfigurationPOS,
} from "@prisma/client";

interface PagSeguroWebhookData {
  notificationCode: string;
  notificationType: string;
}

export async function webHookPagBank(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const webhookData: PagSeguroWebhookData =
      request.body as PagSeguroWebhookData;
    const { notificationCode } = webhookData;

    const url =
      process.env.NODE_ENV == "dev"
        ? `https://ws.pagseguro.uol.com.br/v3/transactions/notifications/283629-C76AE06AE0C5-80047F2F8E42-A1C27F?email=otcrgpassos@gmail.com&token=02c2181d-e08b-4fc5-b62b-6e82b28d2217549256eb4b778b7241bccb32d2617c447eca-ca91-49ad-8414-394c46d54770`
        : `${process.env.PAGSEGURO_URL}transactions/notifications/${notificationCode}?email=${process.env.PAGSEGURO_EMAIL}&token=${process.env.PAGSEGURO_TOKEN}`;

    const response = await axios.get(url);

    const xmlData = response.data;

    let jsonData: WebHookPagBank = {} as WebHookPagBank;
    parseString(xmlData, (err, result) => {
      if (err) {
        console.error("Erro ao analisar o XML:", err);
        reply.status(500).send({ error: "Erro interno do servidor." });
        return;
      }
      jsonData = result as WebHookPagBank;
    });

    const transaction = jsonData.transaction;

    if (transaction) {
      const type = transaction.paymentMethod[0].type[0];

      if (type !== "1" && type !== "3" && type !== "8") {
        return reply.send(200).send();
      }

      const machine = await prisma.pagBankCardMachine.findFirst({
        where: { serialNum: transaction.deviceInfo[0].serialNumber[0] },
        include: {
          plan: {
            include: { taxes: true },
          },
        },
      });

      if (!machine) {
        return console.error(
          `Transação com id: ${transaction.code[0]} sem maquininha associada.`,
        );
      }

      const existingTransaction = await prisma.pagBankTransaction.findUnique({
        where: {
          transactionId: transaction.code[0],
        },
      });

      if (!existingTransaction) {
        const pagBankTransaction = await prisma.pagBankTransaction.create({
          data: {
            transactionId: transaction.code[0],
            machineSerial: transaction.deviceInfo[0].serialNumber[0],
            type: transaction.paymentMethod[0].type[0],
            grossAmount: parseFloat(transaction.grossAmount[0]),
            netAmount: 0,
            notificationResponse: transaction as any,
            isAwaitingTransfer: true,
            installments: parseInt(transaction.installmentCount[0]),
            status: parseInt(transaction.status[0]),
            machineId: machine.id,
          },
        });

        const totalTax = calcTax(pagBankTransaction, machine.plan).tax;

        await prisma.pagBankTransaction.update({
          where: { id: pagBankTransaction.id },
          data: {
            taxTotal: totalTax,
            netAmount: pagBankTransaction.grossAmount - totalTax,
          },
        });
      } else {
        const totalTax = calcTax(existingTransaction, machine.plan).tax;

        const gross = parseFloat(transaction.grossAmount[0]);

        await prisma.pagBankTransaction.update({
          where: {
            id: existingTransaction.id,
          },
          data: {
            transactionId: transaction.code[0],
            machineSerial: transaction.deviceInfo[0].serialNumber[0],
            type: transaction.paymentMethod[0].type[0],
            grossAmount: gross,
            netAmount: gross - totalTax,
            notificationResponse: transaction as any,
            isAwaitingTransfer: true,
            status: parseInt(transaction.status[0]),
            installments: parseInt(transaction.installmentCount[0]),
            taxTotal: totalTax,
            updated_at: new Date(),
          },
        });
      }
    }

    reply.send(transaction);
  } catch (error) {
    console.error("Erro ao lidar com o webhook do PagSeguro:", error);

    reply.status(500).send({ error: "Erro interno do servidor." });
  }
}

function calcTax(
  tx: PagBankTransaction,
  machinePlan: PagPlans & { taxes: TaxConfigurationPOS[] },
) {
  if (!tx.installments || !tx.grossAmount)
    return {
      tax: 0,
      totalToPay: 0,
    };

  const installmentTax =
    tx.type == "1"
      ? machinePlan.taxes.find((tax) => tax.installments == tx.installments)
      : machinePlan.taxes.find((tax) => tax.installments == 0);

  if (!installmentTax || !installmentTax.tax)
    return {
      tax: 0,
      totalToPay: 0,
    };

  const percentage = installmentTax.tax * 0.01; // 1% -> 0.01

  const tax = tx.grossAmount * percentage;

  const totalToPay = tx.grossAmount - tax;

  return {
    tax,
    totalToPay,
  };
}
