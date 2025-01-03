import { TaxConfiguration } from "@prisma/client";

type CalculatedTax = {
  taxDefault: number;
  tax: number;
  total: number;
  taxTotal: number;
};

export default function calculateAmountWithTax(
  taxConfiguration: TaxConfiguration,
  amount: number,
): CalculatedTax {
  let taxDefault = 0;
  let tax = 0;

  const typeDefault = taxConfiguration.taxDefaultType;
  const typeAdmin = taxConfiguration.taxType;

  //calcula taxa default
  if (typeDefault == "NUMBER") {
    taxDefault = taxConfiguration.taxDefault!;
  } else {
    const percentageFloat = taxConfiguration.taxDefault! * 0.01; //(5% fica 5 * 0.01 = 0.05) 👍

    taxDefault = amount * percentageFloat;
    taxDefault = roundUp2DecimalCases(taxDefault);
    if (taxDefault < 0.01) {
      taxDefault = 0.01;
    }
  }

  //calcula taxa do cliente (pixwave)
  if (typeAdmin == "NUMBER") {
    tax = taxConfiguration.tax!;
  } else {
    const percentageFloat = taxConfiguration.tax! * 0.01; //(5% fica 5 * 0.01 = 0.05) 👍

    tax = amount * percentageFloat;
    tax = roundUp2DecimalCases(tax);
    if (tax < 0.01) {
      tax = 0.01;
    }
  }

  return {
    tax: taxDefault < 0.1 ? 0 : tax,
    taxDefault: taxDefault < 0.1 ? 0.1 : taxDefault,
    total: tax + taxDefault + amount,
    taxTotal: tax + taxDefault,
  };
}

export function roundUp2DecimalCases(numero: number) {
  const numeroArredondado = Math.ceil(numero * 100) / 100;
  return parseFloat(numeroArredondado.toFixed(2));
}
