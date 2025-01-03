type TransactionType =
  | "DEBIT_TRANSFER_INTERNAL"
  | "CREDIT_TRANSFER_INTERNAL"
  | "DEBIT_TRANSFER_EXTERNAL"
  | "CREDIT_TRANSFER_EXTERNAL"
  | "DEBIT_PIX"
  | "CREDIT_PIX";

const transactionTypeMap: { [key in TransactionType]: string } = {
  DEBIT_TRANSFER_INTERNAL: "Transferência enviada",
  CREDIT_TRANSFER_INTERNAL: "Transferência recebida",
  DEBIT_TRANSFER_EXTERNAL: "TED enviada - Débito",
  CREDIT_TRANSFER_EXTERNAL: "TED recebida - Crédito",
  DEBIT_PIX: "PIX enviado - Débito",
  CREDIT_PIX: "PIX recebido - Crédito",
};

export function formatTransactionType(type: TransactionType): string {
  return transactionTypeMap[type] || "Tipo de transação desconhecido";
}
