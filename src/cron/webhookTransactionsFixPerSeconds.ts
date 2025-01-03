// import { CronJob } from "cron";
// import { api } from "@/lib/axios";
// import moment from "moment";
// import { prisma } from "@/lib/prisma";
// import PixPaymentUseCase from "@/use-cases/webhook/PixPaymentUseCase";
// import {
//   FailedTransactionDetailsByUser,
//   TransactionDetailsSentToJson,
// } from "@/@types/types";
// import { addTransactionsToJSON, sortByDateDescending } from "@/utils";

// const types = [
//   "PIX_KEY",
//   "PIX_MANUAL",
//   "PIX_RECEIVED",
//   "PIX_QR_CODE_STATIC",
//   "PIX_QR_CODE_DYNAMIC",
// ];

// const chargeTypes = ["PIX_QR_CODE_STATIC", "PIX_QR_CODE_DYNAMIC"];

// export async function wwebhookTransactionsFixPerSeconds(): Promise<void> {
//   // console.log('webhookTransactionsFixPerSeconds');
//   // const aa = new CronJob('*/10 * * * * *', async () => {
//   //   try {
//   //     const format = 'YYYY-MM-DDTHH:mm:ss[Z]';
//   //     const searchEndTime = moment().format(format);
//   //     const searchStartTime = moment().subtract(1, 'day').format(format);
//   //
//   //     const config = {
//   //       headers: {
//   //         'x-delbank-api-key': apiKey,
//   //       },
//   //       params: {
//   //         page: 1,
//   //         limit: 99999,
//   //         isCredit: true,
//   //         endDate: searchEndTime,
//   //         startDate: searchStartTime,
//   //       },
//   //     };
//   //
//   //     const response = await api.get('/baas/api/v2/transactions', config);
//   //
//   //     console.log(response);
//   //
//   //     const existsAccountTransaction = await prisma.accountTransaction.findFirst({
//   //       where: { nsu: response.data.nsu, status: 'done' },
//   //     });
//   //
//   //     const existsGrapichTransaction = await prisma.graphicAccountTransaction.findFirst({
//   //       where: { nsu: response.data.nsu, status: 'done' },
//   //     });
//   //
//   //     for (const transaction of response.data) {
//   //       if (
//   //         !existsAccountTransaction &&
//   //         (existsAccountTransaction!.type === 'PIX_STATIC' || existsAccountTransaction!.type === 'PIX_DINAMIC')
//   //       ) {
//   //         await DelbankWebhookUseCase.chargePaid(transaction, true);
//   //       }
//   //
//   //       if (
//   //         !existsGrapichTransaction &&
//   //         (existsGrapichTransaction!.type === 'PIX_STATIC' || existsGrapichTransaction!.type === 'PIX_DINAMIC')
//   //       ) {
//   //         await DelbankWebhookUseCase.chargePaid(transaction, true);
//   //       }
//   //
//   //       if (response.data.length === 0) {
//   //         for (let i = 0; i < 4; i++) {
//   //           setTimeout(async () => await webhookTransactionsFixPerSeconds(apiKey), 5000);
//   //         }
//   //       }
//   //
//   //       await api.post('localhost:3333/pix/webhook/chargePaid', transaction);
//   //     }
//   //   } catch (error: any) {
//   //     console.error(`Error no cron job  ${error}`);
//   //   }
//   // });
//   //
//   // aa.start();
//   const job = new CronJob(`1-30 * * * *`, async () => {
//     try {
//       const format = "YYYY-MM-DDTHH:mm:ss[Z]";
//       const searchEndTime = moment().format(format);
//       const searchStartTime = moment().subtract(1, "hours").format(format);

//       const failedTransactionDetailsByUser: FailedTransactionDetailsByUser[] =
//         [];

//       const users = await prisma.user.findMany({
//         where: {
//           api_key: { not: null },
//         },
//       });

//       for (const user of users) {
//         if (user.document === "39778028000190") {
//           continue;
//         }
//         const config = {
//           headers: {
//             "x-delbank-api-key": user.api_key,
//           },
//           params: {
//             page: 1,
//             limit: 99999,
//             isCredit: true,
//             endDate: searchEndTime,
//             startDate: searchStartTime,
//           },
//         };

//         const response = await api.get("/baas/api/v2/transactions", config);

//         const transactions = response.data;

//         const transactions_sort = sortByDateDescending(transactions).reverse();

//         let webTransactionCount = 0;
//         let transactionsCreates = 0;
//         const transactionsDetails: TransactionDetailsSentToJson[] = [];

//         for (const transaction of transactions_sort) {
//           const type = transaction?.proof?.type || "";

//           if (types.some((t) => type.includes(t))) {
//             webTransactionCount++;

//             const nsu = transaction?.nsu;

//             if (!nsu) continue;

//             const existsTransaction = await prisma.accountTransaction.findFirst(
//               {
//                 where: { nsu, status: "done" },
//               },
//             );

//             const existsGraphicTransaction =
//               await prisma.graphicAccountTransaction.findFirst({
//                 where: { nsu, status: "done" },
//               });

//             const anyTransactionExists =
//               !!existsTransaction || !!existsGraphicTransaction;

//             if (transaction.id && !anyTransactionExists) {
//               transactionsDetails.push({
//                 nsu: transaction.nsu,
//                 amount: transaction.amount,
//                 createdAt: transaction.createdAt,
//               });

//               if (chargeTypes.some((ct) => type?.includes(ct))) {
//                 await PixPaymentUseCase.chargePaid(transaction, true);
//               } else {
//                 await PixPaymentUseCase.creditPix(transaction, true);
//               }

//               transactionsCreates++;
//             }
//           }
//         }

//         failedTransactionDetailsByUser.push({
//           userId: user.id,
//           webTransactionCount,
//           transactions: transactionsDetails,
//         });
//       }

//       await addTransactionsToJSON(
//         failedTransactionDetailsByUser,
//         "../logs/lostWebhookTransactions1Hour.json",
//         {
//           interval: "1 hour",
//           searchStartTime,
//           searchEndTime,
//         },
//       );
//     } catch (error) {
//       console.error("Erro ao buscar transações:", error);
//     }
//   });

//   job.start();
// }
