import { PrismaClient } from "@prisma/client";

export class SeedTaxConfiguration {
  constructor(private readonly prisma: PrismaClient) {}

  public async execute() {
    taxs.forEach(async (tax) => {
      await this.prisma.taxConfiguration.create({
        data: {
          ...tax,
        },
      });
    });
  }
}

const taxs = [
  {
    name: "PLANOS",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "MANUTENÇÃO DE CONTAS",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "ABERTURA DE CONTAS",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "ENCERRAMENTO DE CONTAS",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "TRANSFERÊNCIA PIX CHECKIN",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "TRANSFERÊNCIA PIX CHECKOUT",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "EMISSÃO DO 1º CARTÃO FÍSICO",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "EMISSÃO DE CARTÕES FÍSICOS ADICIONAIS",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "CARTÃO VIRTUAL ",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "ANUIDADE DO CARTÃO",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "PAGAMENTO DE CONTAS",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "GESTÃO DE COBRANÇA",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "TRANSFERÊNCIAS BANCÁRIAS",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "EMISSÃO DE BOLETO",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "SAQUE",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "APLICAÇÃO AUTOMÁTICA",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "RECEBIMENTO VIA TED",
    tax: 0,
    taxDefault: 0,
  },
  {
    name: "RECEBIMENTO VIA CARTÃO",
    tax: 0,
    taxDefault: 0,
  },
];
