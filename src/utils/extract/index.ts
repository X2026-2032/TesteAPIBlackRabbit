import moment from "moment";

interface ExtractItem {
  status: string;
  id: string;
  direction: "in" | "out";
  description: string;
  amount: number;
  created_at: string;
  operation: string;
  title: string;
  previousValue: number;
  newValue: number;
  GraphicAccount?: {
    id: string;
    name: string;
    document: string;
    number_identifier: string;
  };
  type: string;
  //GraphicAccount: boolean;
  data: any;
  user: {
    access_token: string;
    company_type?: string;
    created_at: Date;
    document: string;
    email: string;
    id: string;
    name: string;
    occupation_id?: string;
    phone: string;
    refId: string;
    role: string;
    status: string;
    type: string;
    updated_at: Date;
  };
  graphic: any;
  response: any;
}
export const getTransactionNames = (transaction: ExtractItem) => {
  const { response, data, direction } = transaction;

  let beneficiaryName = "";
  let payerName = "";

  if (transaction.type.toLowerCase().includes("p2p")) {
    payerName = response?.proof?.payer?.holder?.name;
    beneficiaryName = response?.proof?.beneficiary?.holder?.name;
  }

  if (transaction.type.includes("PAGBANK_PAYMENT")) {
    payerName = data?.payer?.name;
    beneficiaryName = data?.beneficiary?.name;
  }

  if (transaction.type.toLowerCase().includes("pix")) {
    payerName =
      response?.proof?.payer?.holder?.name || response?.payer?.holder?.name;
    beneficiaryName =
      response?.proof?.beneficiary?.holder?.name ||
      response?.beneficiary?.holder?.name;
  }

  if (transaction.type == "INTERNAL_TAX") {
    payerName = response?.payer?.name;
    beneficiaryName = response?.beneficiary?.name;
  }

  if (transaction.type == "TED") {
    payerName = response?.proof?.payer?.holder?.name;
    beneficiaryName = response?.proof?.beneficiary?.holder?.name;
  }

  if (transaction.type == "payment") {
    payerName = "";
    beneficiaryName = response?.beneficiary?.name;
  }

  const newTypes = [
    "PIX_STATIC",
    "PIX_DYNAMIC",
    "PIX_KEY",
    "PIX_MANUAL",
    "INTERNAL_WALLET_TRANSACTION",
    "PIX_COPY_AND_PASTE",
  ];

  if (
    newTypes.some((type) => transaction.type.includes(type)) &&
    direction == "in"
  ) {
    beneficiaryName = "";
    payerName = response.data?.counterparty?.name || response?.payer?.name;
  }

  if (
    newTypes.some((type) => transaction.type.includes(type)) &&
    direction == "out"
  ) {
    beneficiaryName =
      response.data?.counterparty?.name || response?.beneficiary?.name;
    payerName = "";
  }

  beneficiaryName = beneficiaryName ? beneficiaryName : "Desconhecido";
  payerName = payerName ? payerName : "Desconhecido";

  return { beneficiaryName, payerName };
};
export function currencyFormat(currency: number): string {
  if (currency === undefined) {
    return "***";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(currency);
}

export default function transactionLabel(data: {
  direction: string | "in" | "out";
  type: string | "PIX" | "WITHDRAW" | "RECHARGE";
  status: string;
}) {
  const type = data.type.toUpperCase();
  const status = data.status.toUpperCase();
  switch (status) {
    case "PIX_ERROR":
      return "Pix cancelado";
  }

  switch (type) {
    case "PIX_STATIC":
    case "PIX_DYNAMIC":
    case "PIX_KEY":
    case "PIX_MANUAL":
    case "INTERNAL_WALLET_TRANSACTION":
    case "PIX_COPY_AND_PASTE":
    case "PIX":
      if (data.direction == "in") return "Pix recebido";
      if (data.direction == "out") return "Pix enviado";
    case "WITHDRAW":
      if (data.direction == "in") return "Saque de conta C-A";
      if (data.direction == "out") return "";
    case "RECHARGE":
      if (data.direction == "in") return "Recarga";
      if (data.direction == "out") return "";
    case "BANK_SLIPS":
      if (data.direction == "in") return "Recarga";
      if (data.direction == "out") return "Pagamento de conta";
    case "INTERNAL":
    case "P2P":
      return "P2P Interno";
    case "TED":
      return "Transferência";
    case "INTERNAL_TAX":
      return "Taxa interna";
    case "TRANSFER_WITH_PIX":
      return "Pix com agência";
    case "PAGBANK_PAYMENT":
      return "Repasse";
    case "PAGBANK_PAYMENT_DISCOUNT":
      return "Desconto de repasse";
    case "PAYMENT":
      return "Pagamento de conta";
    default:
      return "Desconhecido";
  }
}

export const formatTableTransaction = (item: any) => {
  const type = item.direction === "in" ? "Crédito" : "Débito";
  let varData = "";
  if (item.data && (item.data.payer || item.data.payer_payee)) {
    if (item.data.payer && item.data.payer.name) {
      varData = item.data.payer.name;
    } else if (item.data.payer_payee && item.data.payer_payee?.name) {
      varData = item.data.payer_payee.name;
    }
  }
  if (
    item.response &&
    item.response.payer_payee &&
    item.response.payer_payee.bank_account &&
    item.response.payer_payee.bank_account.name
  ) {
    varData = "Control Account " + item.response.payer_payee?.bank_account.name;
  }

  const names = getTransactionNames(item);

  return {
    type,
    title: transactionLabel(item),
    description: "asdasd",
    status: transactionStatus(item.status, true),
    created_at: dateFormat(item.created_at),
    amount: currencyFormat(item.amount),
    data_item:
      item.direction == "in"
        ? `DE:<br/> ${names.payerName}`
        : `PARA:<br/> ${names.beneficiaryName}`, // beneficiary
  };
};

export const transactionStatus = (status: string, graphic: boolean) => {
  const message: Record<string, string> = {
    denied: "Transação negada",
  };
  return message[status] ?? "Status não encontrado";
};

export function dateFormat(date: Date | string): string {
  return moment(date).format("DD/MM/yyyy HH:mm");
}
