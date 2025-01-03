import { EmailInterface, Mail } from "./mail";
import fs from "fs";
import { chromium } from "playwright";

export async function sendExtractImageToEmail({
  transactionId,
  name,
  to,
}: {
  transactionId: string;
  name: string;
  to: string;
}) {
  try {
    const browser = await chromium.launch({
      executablePath: process.env.CHROME_PATH,
    });

    const page = await browser.newPage({
      viewport: { width: 720, height: 1024 },
    });

    await page.goto(`https://bank.pixwave.com.br/PDF/${transactionId}`);
    await page.waitForSelector("#content", { timeout: 15000 });
    await page.screenshot({ path: `extracts/${transactionId}.png` });

    await browser.close();

    const emailData = {
      sender: process.env.SENDER_EMAIL || "suporte@pixwave.com.br",
      name: process.env.SENDER_NAME || "Pixwave Team",
      email: to,
      subject: "Transação Pixwave",
      body: `Olá ${name}`,
      attachments: [{ path: `extracts/${transactionId}.png` }],
    };

    const mail = new Mail();

    await mail.send(emailData as EmailInterface);

    fs.unlinkSync(`extracts/${transactionId}.png`);
  } catch (error) {
    console.log(error);
  }
}
