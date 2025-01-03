import { truncateString } from "@/utils";
import { logoVilaPayBase64 } from "@/utils/extract/assets";
import { Account, GraphicAccount, User } from "@prisma/client";

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

interface BankParticipant {
  name: string;
  ispb: string;
}

const formatDate = (date: string) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

export const ExtractHtmlDelbank = async ({
  data,
  user,
  account,
  isWallet,
  startDate,
  endDate,
  date,
}: {
  data: Transaction[];
  user:
    | (User & { number_identifier: number; balance: number })
    | (GraphicAccount & { number_identifier: number });
  account: Account[] & {
    account_number: number;
    balance: number;
    account_digit: number;
  };
  isWallet: boolean;
  startDate: string;
  endDate: string;
  date: string;
}) => {
  let transactionsHtml = `
      <div style="margin-bottom: 10px;">
        <div style="padding: 10px; background-color: #E4E9EB">
          <strong>Lançamentos | ${date}</strong>
        </div>
        <table style="width: 100%; border: 1px solid gainsboro">
          <tr>
            <th style="color: #AA7339; padding: 12px; text-align: left">Data</th>
            <th style="color: #AA7339; padding: 12px; text-align: left">Lançamento</th>
            <th style="color: #AA7339; padding: 12px; text-align: left">Nsu</th>
            <th style="color: #AA7339; padding: 12px; text-align: left">Valor</th>
            <th style="color: #AA7339; padding: 12px; text-align: left">Tipo</th>
          </tr>`;
  let periodoVisualizacao = "";

  if (startDate && endDate) {
    periodoVisualizacao =
      "Período de visualização: " +
      formatDate(startDate) +
      " até " +
      formatDate(endDate);
  }

  const accountNumber = !isWallet
    ? account && account.account_number && account.account_digit
      ? `${account.account_number}-${account.account_digit}`
      : account &&
        account[0] &&
        account[0].account_number &&
        account[0].account_digit
      ? `${account[0].account_number}-${account[0].account_digit}`
      : "No account information available"
    : `${user.number_identifier}`;

  data.forEach((transaction) => {
    transactionsHtml += `
        <tr>
          <td style="padding: 8px">${formatDate(transaction.createdAt)}</td>
          <td style="padding: 8px">${truncateString(
            transaction.proof.beneficiary.holder.name,
          )}</td>
          <td style="padding: 8px">${transaction.nsu}</td>
          <td style="padding: 8px; color: ${
            transaction.type.name === "DEBIT_TRANSFER_INTERNAL"
              ? "#FF1F1F"
              : "#12EA34"
          }">
          <b>${Number(transaction.amount).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}</b>
          </td>
          <td style="padding: 8px"><b>${transaction.type.description}</b></td>
        </tr>`;
  });
  transactionsHtml += `</table></div>`;

  return `
        <!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <title>Extrato</title>
  </head>
  <body
    style="
      font-family: Montserrat, sans-serif;
      font-optical-sizing: auto;
      font-style: normal;
    "
  >
    <nav>
      <div
        style="
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 20px;
          border: 1px solid gainsboro;
          align-items: center;
        "
      >
        <span style="display: flex; align-items: center; height: 100%;">
          <img src="${logoVilaPayBase64}" width="200" alt="vilabank" style="max-height: 100%;" />
        </span>
        <div style="display: flex; flex-direction: column;">
          <div style="display: flex; flex-direction: column;">
            <h3>${truncateString(user.name)}</h3>
            <h4>CNPJ/CPF: ${user.document}</h4>
          <div/>
          <div style="display: flex">
            <h4 style="color: black;">Agência:&nbsp;${
              isWallet ? "1002" : "0001"
            }&nbsp;</h4>
            <h4 style="color: black;">Banco:&nbsp;0435&nbsp;</h4>
            <h4 style="color: black;">${
              isWallet ? "Nº Identificador" : "Conta"
            }:&nbsp;${accountNumber}</h4>
          </div>
        </div>
      </div>
    </nav>
    <header>
      <div
        style="
          display: flex;
          justify-content: start;
          align-items: start;
        "
      >
          <h3>Extrato de Conta Corrente</h3>
        </div>
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <p>${periodoVisualizacao}</p>
          <p>Emitido dia ${date}</p>
        </div>
    </header>
    <main>
      ${transactionsHtml}
    </main>
    <footer>
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10vh;
        "
      >
        <div>
          <h2 style="color: red">Aviso!</h2>
          <p>
            Os saldos acima são baseados nas informações disponíveis até esse
            instante e <br />
            poderão ser alterados a qualquer momento em função de novos
            lançamentos.
          </p>
        </div>   
          <img src="${logoVilaPayBase64}" width="200" alt="vilabank" />  
      </div>
    </footer>
  </body>
</html>

        
        `;
};
