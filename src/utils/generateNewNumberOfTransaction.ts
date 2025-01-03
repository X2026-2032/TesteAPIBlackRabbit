import { prisma } from "@/lib/prisma";

export async function getMaxNumberOfTransactionByAccountTransactions() {
  const allTransactions = await prisma.accountTransaction.findMany();

  let maxNumberOfTransaction = 0;

  allTransactions.forEach((transaction) => {
    if (transaction.number_of_transaction) {
      if (transaction.number_of_transaction > maxNumberOfTransaction) {
        maxNumberOfTransaction = transaction.number_of_transaction;
      }
    }
  });

  return maxNumberOfTransaction + 1;
}

export async function getMaxNumberOfTransactionByGraphicAccountTransactions() {
  const allTransactions = await prisma.graphicAccountTransaction.findMany();

  let maxNumberOfTransaction = 0;

  allTransactions.forEach((transaction) => {
    if (transaction.number_of_transaction) {
      if (transaction.number_of_transaction > maxNumberOfTransaction) {
        maxNumberOfTransaction = transaction.number_of_transaction;
      }
    }
  });

  return maxNumberOfTransaction + 1;
}
