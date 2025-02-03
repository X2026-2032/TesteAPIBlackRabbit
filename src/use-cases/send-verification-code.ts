// import { UsersRepository } from "@/repositories/users-messenger-respository";
// import { GetUsersAccountToken } from "./get-users-account-token";
// import { IdezPixService } from "@/service/idez/pix";

// interface SendVerificationCodeCaseRequest {
//   userId: string;
//   type:
//     | "pix.email"
//     | "pix.phone"
//     | "sms"
//     | "credit"
//     | "email"
//     | "loan"
//     | "password"
//     | "pin";
// }

// export class SendVerificationCodeUseCase {
//   constructor(private usersRepository: UsersRepository) {}

//   async execute({ userId, type }: SendVerificationCodeCaseRequest) {
//     const token = await GetUsersAccountToken.execute(userId);
//     if (!token) throw new Error("Usuário inválido");

//     return await new IdezPixService().verificationCode(
//       type,
//       token.access_token,
//     );
//   }
// }
