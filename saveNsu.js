const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const main = async () => {
  try {
    const transactions = await prisma.accountTransaction.findMany();
    const graphicTransactions =
      await prisma.graphicAccountTransaction.findMany();

    let transactionsUpdateds = 0;
    let graphicTransactionsUpdateds = 0;

    for (const transaction of transactions) {
      const nsu = transaction?.response?.nsu
        ? parseInt(transaction?.response?.nsu)
        : undefined;

      if (nsu) {
        await prisma.accountTransaction.update({
          where: { id: transaction.id },
          data: { nsu },
        });
        transactionsUpdateds++;
      }
    }

    for (const transaction of graphicTransactions) {
      const nsu = transaction?.response?.nsu;

      if (nsu) {
        await prisma.graphicAccountTransaction.update({
          where: { id: transaction.id },
          data: { nsu },
        });
        graphicTransactionsUpdateds++;
      }
    }

    console.log(`Atualizadas: ${transactionsUpdateds} transacoes`);
    console.log(
      `Atualizadas: ${graphicTransactionsUpdateds} transacoes graficas`,
    );
    console.log(
      `Total: ${
        graphicTransactionsUpdateds + transactionsUpdateds
      } transactoes com nsu`,
    );
  } catch (error) {
    console.log(error);
  }
};

main();
