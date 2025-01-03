import { logoVilaPayBase64 } from "@/utils/extract/assets";
import { GraphicAccount } from "@prisma/client";

export const PagBankPaymentStatus = {
  ANALYSIS: 2,
  COMPLETE: 3,
  DONE: 4,
  REFOUND: 8,
  RETURNED: 6,
  CANCELED: 7,
};

type TransactionData = {
  id: string;
  type: string;
  grossAmount: number;
  netAmount: number;
  taxTotal: number;
  isAwaitingTransfer: boolean;
  installments: number;
  machineId: string;
  machineSerial: string;
  transactionId: string;
  created_at: string;
  updated_at: string;
  status: number;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

interface ExtractProps {
  machineTransactions: TransactionData[];
  date: string;
  endDate: string;
  startDate: string;
  graphicAccount: GraphicAccount;
}

export const ExtractHtmlMachine = async ({
  machineTransactions,
  startDate,
  endDate,
  date,
  graphicAccount,
}: ExtractProps) => {
  let transactionsHtml = "";
  let periodoVisualizacao = "";

  if (startDate && endDate) {
    periodoVisualizacao =
      "Período de visualização: " +
      formatDate(startDate) +
      " até " +
      formatDate(endDate);
  }

  transactionsHtml += `
      <div style="margin-bottom: 10px;">
        <div style="padding: 10px; background-color: #E4E9EB">
          <strong>Lançamentos | ${date}</strong>
        </div>
        <table style="width: 100%; border: 1px solid gainsboro">
          <tr>
            <th style="color: #AA7339; padding: 15px; text-align: left">Data</th>
            <th style="color: #AA7339; padding: 15px; text-align: left">Maquininha</th>
            <th style="color: #AA7339; padding: 15px; text-align: left">Status</th>
            <th style="color: #AA7339; padding: 15px; text-align: left">Tipo</th>
            <th style="color: #AA7339; padding: 15px; text-align: left">Valor Bruto</th>
            <th style="color: #AA7339; padding: 15px; text-align: left">Valor Liquido</th>
          </tr>`;

  machineTransactions.forEach((transaction) => {
    transactionsHtml += `
            <tr>
            <td style="padding: 15px">${formatDate(transaction.created_at)}</td>
            <td style="padding: 15px">Maquina: ${transaction.machineSerial}</td>
            <td style="padding: 15px; max-width: 180px;">
                ${
                  transaction.status === PagBankPaymentStatus["COMPLETE"] ||
                  transaction.status === PagBankPaymentStatus["DONE"]
                    ? `<div class="flex items-center ml-8">
                    <span class="check-circle" style="color:#4AD858; height:20px; width:20px; margin-right:4px;"></span>
                    Aprovada ${
                      transaction.isAwaitingTransfer
                        ? "| Aguardando repasse"
                        : "| Pago"
                    }
                </div>`
                    : transaction.status === PagBankPaymentStatus["ANALYSIS"]
                    ? `<div class="flex items-center ml-8">
                    <span class="clock" style="color:#d3d84a; height:20px; width:20px; margin-right:4px;"></span>
                    Em análise
                </div>`
                    : transaction.status === PagBankPaymentStatus["REFOUND"]
                    ? `<div class="flex items-center ml-8">
                    <span class="undo" style="color:#d87c4a; height:20px; width:20px; margin-right:4px;"></span>
                    Devolvida
                </div>`
                    : `<div class="flex items-center ml-8">
                    <span class="x-circle" style="color:#d84a4a; height:20px; width:20px; margin-right:4px;"></span>
                    Cancelada
                </div>`
                }
            </td>
            <td style="padding: 15px">${
              transaction.status === 1
                ? `Crédito ${transaction.installments}x`
                : `Débito`
            }</td>
            <td style="padding: 15px; max-width: 150px;">${transaction.grossAmount.toLocaleString(
              "pt-BR",
              { style: "currency", currency: "BRL" },
            )}</td>
            <td style="padding: 15px; max-width: 150px;">${transaction.netAmount.toLocaleString(
              "pt-BR",
              { style: "currency", currency: "BRL" },
            )}</td>
            </tr>`;
  });

  transactionsHtml += "</table></div>";

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
          justify-content: center;
          gap: 20px;
          padding: 20px;
          border: 1px solid gainsboro;
          align-items: center;
        "
      >
        <span>
          <img src="${logoVilaPayBase64}" width="200" alt="vilabank" />
        </span>
   
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
          <h3>Extrato da Maquininha</h3>
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
