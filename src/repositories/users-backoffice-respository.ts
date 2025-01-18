import { Prisma, User } from "@prisma/client";

export type UserWithAccount =
  | (User & {
      Account: {
        refId: string;
        branch_number: string | null;
        account_number: string | null;
        account_digit: string | null;
      }[];
    })
  | null;

export interface UsersRepository {
  create(data: Prisma.UserCreateInput): Promise<User>;
  save(data: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findByDocument(document: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
