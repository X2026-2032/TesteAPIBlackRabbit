const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const main = async () => {
  try {
    const transactions = await prisma.accountTransaction.findMany();
    const graphicTransactions = await prisma.graphicAccountTransaction.findMany();

    let transactionsUpdateds = 0;
    let graphicTransactionsUpdateds = 0;

    await prisma.$transaction(async (tx) => {
      for (const transaction of transactions) {
        const order_id = transaction?.response?.proof?.endToEndId;
  
        if (order_id) {
          await tx.accountTransaction.update({ where: { id: transaction.id }, data: { order_id } });
          transactionsUpdateds++;
        }
      }
  
      for (const transaction of graphicTransactions) {
        const order_id = transaction?.response?.proof?.endToEndId;
  
        if (order_id) {
          await tx.graphicAccountTransaction.update({ where: { id: transaction.id }, data: { order_id } });
          graphicTransactionsUpdateds++;
        }
      }
    })


    console.log(`Atualizadas: ${transactionsUpdateds} transacoes`);
    console.log(`Atualizadas: ${graphicTransactionsUpdateds} transacoes graficas`);
    console.log(`Total: ${graphicTransactionsUpdateds + transactionsUpdateds} transactoes com nsu`);
  } catch (error) {
    console.log(error);
  }
};

main();
