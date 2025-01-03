import { truncateString } from "@/utils";
import { logoVilaPayBase64 } from "@/utils/extract/assets";

type Transaction = {
  date: string;
  type: string;
  transaction: string;
  description: string;
  value: string;
  status: string;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

export const ExtractHtmlBackoffice = async ({
  data,
  startDate,
  endDate,
  date,
}: {
  data: { [date: string]: Transaction[] };
  startDate: string;
  endDate: string;
  date: string;
}) => {
  let transactionsHtml = "";
  let periodoVisualizacao = "";

  if (startDate && endDate) {
    periodoVisualizacao =
      "Período de visualização: " +
      formatDate(startDate) +
      " até " +
      formatDate(endDate);
  }

  for (const date in data) {
    transactionsHtml += `
      <div style="margin-bottom: 10px;">
        <div style="padding: 10px; background-color: #E4E9EB">
          <strong>Lançamentos | ${date}</strong>
        </div>
        <table style="width: 100%; border: 1px solid gainsboro">
          <tr>
            <th style="color: #AA7339; padding: 15px; text-align: left">Data</th>
            <th style="color: #AA7339; padding: 15px; text-align: left">Tipo</th>
            <th style="color: #AA7339; padding: 15px; text-align: left">Transação</th>
            <th style="color: #AA7339; padding: 15px; text-align: left">Beneficiário / Pagador</th>
            <th style="color: #AA7339; padding: 15px; text-align: left">Valor</th>
          </tr>`;

    data[date].forEach((transaction) => {
      transactionsHtml += `
        <tr>
          <td style="padding: 15px">${transaction.date}</td>
          <td style="padding: 15px">${transaction.type}</td>
          <td style="padding: 15px; max-width: 150px;">${
            transaction.transaction
          }</td>
          <td style="padding: 15px; max-width: 150px;">${truncateString(
            transaction.description,
          )}</td>
          <td style="padding: 15px; color: ${
            transaction.value.includes("-")
              ? "#FF1F1F"
              : transaction.value.includes("#")
              ? "black"
              : "#12EA34"
          }"><b ${
        transaction.status === "pix_error"
          ? 'style="text-decoration: line-through"'
          : ""
      }>${transaction.value}</b></td>      
        </tr>`;
    });

    transactionsHtml += `</table></div>`;
  }

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
