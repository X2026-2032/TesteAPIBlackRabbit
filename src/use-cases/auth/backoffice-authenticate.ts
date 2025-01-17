import { UsersRepository } from "@/repositories/users-messenger-respository";
import { Role } from "@prisma/client";
import { AppError } from "../errors/app-error";
import { prisma } from "@/lib/prisma";
import { compareSync } from "bcryptjs";
import { requestError } from "@/lib/axios";

interface UserData {
  id: string;
  name?: string;
  document?: string | null;
  email: string;
  password?: string | null;
  phone?: any; // Altere para o tipo correto de phone
  role: Role;
  status?: string;
  refId?: string | null;
  access_token?: string | null;
}

interface BackofficeAuthenticateUseCaseRequest {
  email: string;
  password: string;
}

interface BackofficeAuthenticateUseCaseResponse<T extends UserData> {
  user: T;
}

export class BackofficeAuthenticateUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute<T extends UserData>({
    email,
    password,
  }: BackofficeAuthenticateUseCaseRequest): Promise<
    BackofficeAuthenticateUseCaseResponse<T>
  > {
    try {
      console.log("Trying to find user by email:", email);
      const user = await this.usersRepository.findByEmail(email);
      console.log("User found:", user);

      if (!user) {
        const operatorAccount = await prisma.operatos.findUnique({
          where: {
            email,
          },
        });

        if (operatorAccount) {
          const operator: UserData = {
            id: operatorAccount.id,
            email: operatorAccount.email,
            role: operatorAccount.role,
            name: operatorAccount.name,
            document: operatorAccount.document,
            status: operatorAccount.status,
            phone: operatorAccount.phone,
            access_token: operatorAccount.access_token,
            password: operatorAccount.password,
          };
          const passwordIsValid = compareSync(
            password,
            operator.password as string,
          );
          if (!passwordIsValid) {
            throw new AppError(error);
          }

          return { user: operator } as BackofficeAuthenticateUseCaseResponse<T>;
        }
      }

      const error = {
        status: 400,
        code: "auth.invalid_credentials",
        message: "Invalid credentials.",
      };

      if (
        !user ||
        (user?.role !== Role.ADMIN &&
          user?.role !== Role.MASTER &&
          user?.role !== Role.ADMIN_BAG &&
          user?.role !== Role.OPERATOR)
      ) {
        throw new AppError(error);
      }

      const passwordIsValid = compareSync(password, user.password as string);
      if (!passwordIsValid) {
        throw new AppError(error);
      }

      return { user } as unknown as BackofficeAuthenticateUseCaseResponse<T>;
    } catch (error) {
      throw new AppError(requestError(error));
    }
  }
}
