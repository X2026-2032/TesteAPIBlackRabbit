import fs from "fs";
import path from "path";
import html_to_pdf from "html-pdf-node";

import { prisma } from "@/lib/prisma";
import { FastifyReply, FastifyRequest } from "fastify";
import { ExtractHtmlDelbank } from "@/html/extractHtmlDelbank";

interface Transaction {
  id: string;
  nsu: number;
  amount: number;
  createdAt: string;
  type: TransactionType;
  balance: Balance;
  proof: Proof;
}

interface TransactionType {
  name: string;
  description: string;
  isCredit: boolean;
}

interface Balance {
  balancePrevious: number;
  currentBalance: number;
}

interface Proof {
  id: string;
  externalId: string;
  status: string;
  type: string;
  amount: number;
  createdAt: string;
  payer: Participant;
  beneficiary: Participant;
}

interface Participant {
  number: string;
  branch: string;
  type: string;
  holder: Holder;
  participant: BankParticipant;
}

interface Holder {
  document: string;
  name: string;
  type: string;
}

interface ExtractProps {
  data: Transaction[];
  endDate: string;
  date: string;
  startDate: string;
  user_id?: string;
}

interface BankParticipant {
  name: string;
  ispb: string;
}

class ExportDelbank {
  async execute(req: FastifyRequest, res: FastifyReply) {
    try {
      const { data, startDate, endDate, date, user_id } =
        req.body as ExtractProps;

      const user = await prisma.user.findUnique({
        where: {
          id: user_id,
        },
        include: {
          Account: true,
        },
      });

      const graphic = await prisma.graphicAccount.findUnique({
        where: {
          id: user_id,
        },
        include: {
          account: true,
        },
      });

      const _user: any = user || graphic;
      const _account: any = user?.Account || graphic?.account;
      const isWallet = user ? false : true;

      const html = await ExtractHtmlDelbank({
        data,
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

export { ExportDelbank };
