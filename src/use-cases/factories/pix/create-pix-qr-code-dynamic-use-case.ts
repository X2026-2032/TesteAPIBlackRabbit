// import { api, requestError } from "@/lib/axios";
// import { prisma } from "@/lib/prisma";
// import { UsersRepository } from "@/repositories/users-messenger-respository";
// import { AppError } from "@/use-cases/errors/app-error";
// import { GetUsersAccountToken } from "@/use-cases/get-users-account-token";
// import { getMaxNumberOfTransactionByGraphicAccountTransactions } from "@/utils";

// interface PixQrCodeDynamicCaseRequest {
//   userId: string;
//   type: string;
//   key: string;
//   amount: number;
//   id_tx?: string;
//   payer: {
//     name: string;
//     document: string;
//     question: string;
//   };
//   date_expiration: string;
//   allow_change: boolean;
//   detail: {
//     title: string;
//     content: string;
//   };
// }

// export class PixQrCodeDynamicUseCase {
//   constructor(private usersRepository: UsersRepository) {}

//   async execute({
//     userId,
//     type,
//     key,
//     amount,
//     id_tx,
//     payer,
//     date_expiration,
//     allow_change,
//     detail,
//   }: PixQrCodeDynamicCaseRequest) {
//     const token = await GetUsersAccountToken.execute(userId);
//     if (!token) throw new Error("Usuário inválido");

//     try {
//       const response = await api.post(
//         `/pix/qr-codes/dynamic`,
//         {
//           type,
//           key,
//           amount,
//           id_tx,
//           payer,
//           date_expiration,
//           allow_change,
//           detail,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token.access_token}`,
//           },
//         },
//       );

//       const responseData = response.data; // Dados da resposta da requisição
//       const { idTx } = responseData; // Atribuindo o valor de idTx a uma variável

//       // Atualizando os dados no banco de dados usando Prisma
//       await prisma.qrCode.update({
//         where: {
//           // Defina a condição correta para identificar o registro que você deseja atualizar
//           // Por exemplo, se userId é o campo correto para identificar exclusivamente o registro, use algo como:
//           id: userId, // O valor de userId que você deseja usar para identificar o registro
//         },
//         data: {
//           response_tx_id: responseData, // Use a propriedade correta para o ID da transação da resposta
//         },
//       });
//       const number_of_transaction =
//         await getMaxNumberOfTransactionByGraphicAccountTransactions();
//       // Persistir o userId no banco de dados usando Prisma
//       await prisma.graphicAccountTransaction.create({
//         data: {
//           ...responseData, // Inclua quaisquer valores padrão necessários aqui
//           user_id_graphic: userId,
//           ...response,
//           direction: null,
//           amount: null,
//           number_of_transaction,
//         },
//       });

//       // Adicione os logs desejados aqui
//       console.log(
//         "Dados persistidos com sucesso: vindo do back end ",
//         responseData,
//       );
//       console.log("userId persistido:  vindo do back end  ", userId);
//       return response.data; // Retornar a resposta da requisição
//     } catch (err) {
//       const error = requestError(err);

//       if (error) {
//         throw new AppError({
//           status: error.status,
//           code: error.code,
//           message: error.message,
//         });
//       }
//     }
//   }
// }
