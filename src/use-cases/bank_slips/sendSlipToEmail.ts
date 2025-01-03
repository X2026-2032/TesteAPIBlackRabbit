import { BankSlipRepository } from "@/repositories/bank-slip-repository";
import { EmailInterface, Mail } from "@/utils/mail";
import { BankSlip } from "@prisma/client";
import { chromium } from "playwright";
import fs from "fs";

export class SendSlipToEmail {
  constructor(private repository: BankSlipRepository) {}

  static async execute(data: {
    email: string;
    bankSlip: BankSlip;
  }): Promise<void> {
    const { email, bankSlip } = data;

    const browser = await chromium.launch({
      executablePath:
        process.env.NODE_ENV == "dev" ? undefined : process.env.CHROME_PATH,
    });

    const page = await browser.newPage({
      viewport: { width: 720, height: 1024 },
    });

    await page.goto(
      `https://www.vilapaybank.com.br/billets/print/${bankSlip.id}`,
    );

    await page.waitForSelector("#content", { timeout: 15000 });
    await page.screenshot({ path: `slips/${bankSlip.id}.png` });

    await browser.close();

    const emailData = {
      sender: process.env.SENDER_EMAIL || "",
      name: process.env.SENDER_NAME || "VilapayBank Team",
      email: email,
      subject: "Seu boleto",
      body: `Olá, seu boleto de R$${bankSlip.amount} chegou.`,
      attachments: [{ path: `slips/${bankSlip.id}.png` }],
    };

    const mail = new Mail();

    await mail.send(emailData as EmailInterface);
    fs.unlinkSync(`slips/${bankSlip.id}.png`);
  }
}
