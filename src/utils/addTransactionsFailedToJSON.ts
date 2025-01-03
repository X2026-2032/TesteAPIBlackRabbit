import fs from "fs";
import path from "path";
import moment from "moment";
import jsonfile from "jsonfile";
import { Prisma } from "@prisma/client";
import { FailedTransactionDetailsByUser } from "@/@types/types";

interface TransactionFailedDetails {
  amount: number;
  description: string | null;
  beneficiary: Prisma.JsonValue;
}
interface JsonDetails {
  interval: string;
  searchEndTime: string | Date;
  searchStartTime: string | Date;
}

function getTotalTransactions(
  transactionsArray: FailedTransactionDetailsByUser[],
) {
  let totalTransactions = 0;
  for (const entry of transactionsArray) {
    totalTransactions += entry.webTransactionCount;
  }
  return totalTransactions;
}

export async function addTransactionsToJSON(
  transactions: FailedTransactionDetailsByUser[],
  jsonFileName: string,
  JsonDetails: JsonDetails,
) {
  const jsonPath = path.resolve(__dirname, jsonFileName);
  try {
    const dir = path.dirname(jsonPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let existingData: any[] = [];

    try {
      existingData = await jsonfile.readFile(jsonPath);
    } catch (readError: any) {
      if (readError.code !== "ENOENT") {
        console.error("Erro ao ler arquivo JSON:", readError);
        throw readError;
      }
    }

    existingData.push({
      totalTransactionsLost: getTotalTransactions(transactions),
      executedDate: moment().format("YYYY-MM-DD"),
      executedTime: moment().format("HH:mm:ss"),
      ...JsonDetails,
      transactions,
    });

    await jsonfile.writeFile(jsonPath, existingData, { spaces: 2 });
  } catch (fileError) {
    console.error("Erro ao gravar arquivo JSON:", fileError);
  }
}
