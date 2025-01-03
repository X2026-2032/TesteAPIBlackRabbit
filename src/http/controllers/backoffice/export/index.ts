import fs from "fs";
import path from "path";
import html_to_pdf from "html-pdf-node";
import { AccountTransaction } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { ExtractHtmlBackoffice } from "@/html/extractHtmlBackoffice";
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
  isWallet: boolean;
}

class Export {
  async execute(req: FastifyRequest, res: FastifyReply) {
    try {
      const { data, startDate, endDate, date, isWallet } =
        req.body as ExtractProps;

      const transactionsByDate: { [key: string]: any[] } = {};
      for (const groupedTransactions of data) {
        groupedTransactions.transactions.map((item: any) => {
          if (item.status === "done" || item.status === "pix_error") {
            const { created_at, type, data_item, title } =
              formatTableTransaction(item);

            const dateWithoutTime = created_at.split(" ")[0];

            if (!transactionsByDate[dateWithoutTime]) {
              transactionsByDate[dateWithoutTime] = [];
            }

            transactionsByDate[dateWithoutTime].push({
              date: created_at,
              type,
              status: item.status,
              transaction: title,
              description: data_item,
              value:
                !isWallet && item.type === "PAGBANK_PAYMENT_DISCOUNT"
                  ? "######"
                  : `${item.direction == "in" ? "+" : "-"} ${currencyFormat(
                      Number(item.amount),
                    )}`,
            });
          }
        });
      }

      const html = await ExtractHtmlBackoffice({
        data: transactionsByDate,
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
      const tempDir = path.join(__dirname, "../../../../", "temp");

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const fileName = `backoffice_${Date.now()}.pdf`;
      const filePath = path.join(tempDir, fileName);

      const file = { content: html };
      await html_to_pdf.generatePdf(file, options, async (err, pdfBuffer) => {
        if (err) {
          throw err;
        }

        fs.writeFileSync(filePath, pdfBuffer);
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
