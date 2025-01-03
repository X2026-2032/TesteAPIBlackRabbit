import fs from "fs";
import path from "path";
import html_to_pdf from "html-pdf-node";

import { prisma } from "@/lib/prisma";
import { AccountTransaction } from "@prisma/client";
import { ExtractHtml } from "@/html/extractHtml";
import { FastifyReply, FastifyRequest } from "fastify";
import { currencyFormat, formatTableTransaction } from "@/utils/extract";

interface ExtractProps {
  data: Array<{
    in: number;
    out: number;
    total: number;
    rawData: string;
    date: string;
    transactions: AccountTransaction[];
  }>;
  endDate: string;
  date: string;
  startDate: string;
  account_id?: string;
  graphicAccount_Id?: string;
  user_id?: string;
}

class Export {
  async execute(req: FastifyRequest, res: FastifyReply) {
    try {
      const {
        data,
        startDate,
        endDate,
        date,
        account_id,
        graphicAccount_Id,
        user_id,
      } = req.body as ExtractProps;

      let userId;

      if (account_id) {
        const account = await prisma.account.findUnique({
          where: {
            id: account_id,
          },
          include: {
            user: true,
            GraphicAccount: true,
          },
        });
        userId = account?.user_id;
      } else if (graphicAccount_Id) {
        const account = await prisma.graphicAccount.findUnique({
          where: {
            id: graphicAccount_Id,
          },
          include: {
            user: true,
          },
        });
        userId = account?.id;
      } else if (user_id) {
        userId = user_id;
      } else {
        userId = req?.user?.sub;
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          Account: true,
        },
      });

      const graphic = await prisma.graphicAccount.findUnique({
        where: {
          id: userId,
        },
        include: {
          account: true,
        },
      });

      const _user: any = user || graphic;
      const _account: any = user?.Account || graphic?.account;
      const isWallet = user ? false : true;

      const transactionsByDate: { [key: string]: any[] } = {};
      for (const groupedTransactions of data) {
        groupedTransactions.transactions.map((item: any) => {
          if (item.status === "done" || item.status === "pix_error") {
            const document_out =
              item.response?.proof?.beneficiary?.holder?.document ||
              item.response?.beneficiary?.holder?.document ||
              item.response?.toJSON?.beneficiary?.document ||
              item.data?.beneficiary?.document ||
              item.data?.data?.counterparty?.tax_number ||
              item.response?.data?.counterparty?.tax_number ||
              "";

            const document_int =
              item.response?.proof?.payer?.holder?.document ||
              item.response?.payer?.holder?.document ||
              item.response?.toJSON?.payer?.document ||
              item.data?.payer?.document ||
              item.data?.data?.counterparty?.tax_number ||
              item.response?.data?.counterparty?.tax_number ||
              "";

            const { created_at, data_item } = formatTableTransaction(item);

            const dateWithoutTime = created_at.split(" ")[0];

            if (!transactionsByDate[dateWithoutTime]) {
              transactionsByDate[dateWithoutTime] = [];
            }

            const saldo = item.ReportBalance[0]?.amount || "*****";

            transactionsByDate[dateWithoutTime].push({
              date: created_at,
              lancamento: data_item,
              document: item.direction === "in" ? document_int : document_out,
              orderId: item.order_id
                ? item.order_id.substring(item.order_id.length - 7)
                : "#######",

              valor: `${item.direction == "in" ? "+" : "-"} ${currencyFormat(
                Number(item.amount),
              )}`,
              status: item.status,
              saldo: saldo === "*****" ? saldo : currencyFormat(Number(saldo)),
            });
          }
        });
      }
      const html = await ExtractHtml({
        data: transactionsByDate,
        user: _user,
        account: _account[0],
        isWallet,
        startDate,
        endDate,
        date,
      });

      const options: html_to_pdf.Options = {
        format: "A4",
        margin: {
          bottom: 20,
          left: 20,
          right: 20,
          top: 20,
        },
      };
      const tempDir = path.join(__dirname, "../../../", "temp");

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const fileName = `extract_${Date.now()}.pdf`;
      const filePath = path.join(tempDir, fileName);

      const file = { content: html };
      await html_to_pdf.generatePdf(file, options, async (err, pdfBuffer) => {
        if (err) {
          throw err;
        }

        fs.writeFileSync(filePath, pdfBuffer);

        console.log("PDF gerado em:", filePath);
      });

      const pdfBuffer = fs.readFileSync(filePath);

      const pdfBase64 = pdfBuffer.toString("base64");

      res.send({ pdfBase64 });

      fs.unlinkSync(filePath);
    } catch (err: unknown) {
      console.log(err);

      if (err instanceof Error) {
        throw err;
      } else {
        throw new Error("Ocorreu um erro desconhecido");
      }
    }
  }
}

export { Export };
