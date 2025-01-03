import { prisma } from "@/lib/prisma";
import { AppError } from "../errors/app-error";
import calculateAmountWithTax from "@/utils/calculateAmountWithTax";

type ExecuteProps = {
  account_id: string;
  transactionAmmount: number;
  taxType: string;
};

export class VerifyTaxUseCase {
  static async execute(data: ExecuteProps) {
    const tax = await prisma.taxConfiguration.findFirst({
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

    const calculatedTax = calculateAmountWithTax(tax, data.transactionAmmount);

    if (graphic && graphic.balance < calculatedTax.total)
      throw new AppError({ message: "Saldo insuficiente", status: 401 });

    if (account && account.balance! < calculatedTax.total)
      throw new AppError({ message: "Saldo insuficiente", status: 401 });

    return calculatedTax;
  }
}
