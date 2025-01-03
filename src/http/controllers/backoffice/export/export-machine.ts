import fs from "fs";
import path from "path";
import html_to_pdf from "html-pdf-node";
import { FastifyReply, FastifyRequest } from "fastify";
import { ExtractHtmlMachine } from "@/html/ExtractHtmlMachine";
import { prisma } from "@/lib/prisma";

type TransactionData = {
  id: string;
  type: string;
  grossAmount: number;
  netAmount: number;
  taxTotal: number;
  isAwaitingTransfer: boolean;
  installments: number;
  machineId: string;
  machineSerial: string;
  transactionId: string;
  created_at: string;
  updated_at: string;
  status: number;
};

interface ExtractProps {
  machineTransactions: TransactionData[];
  date: string;
  endDate: string;
  startDate: string;
  graphicAccountId: string;
}

class ExportMachine {
  async execute(req: FastifyRequest, res: FastifyReply) {
    try {
      const {
        machineTransactions,
        startDate,
        endDate,
        date,
        graphicAccountId,
      } = req.body as ExtractProps;

      const graphic = await prisma.graphicAccount.findFirst({
        where: {
          id: graphicAccountId,
        },
      });

      const html = await ExtractHtmlMachine({
        machineTransactions,
        startDate,
        endDate,
        date,
        graphicAccount: graphic!,
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

export { ExportMachine };
