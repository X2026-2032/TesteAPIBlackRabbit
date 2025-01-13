import { GraphicAccount, Prisma } from "@prisma/client";

export type GraphicAccountUser =
  | (GraphicAccount & {
      GraphicAccountUser: {
        id: string;
        name: string;
        userName: string;
        hardPassword: string;
        password: string;
        status: string;
        created_at: Date;
        access_token: string;
        blocked: boolean;
        counter: number;
        role: "MEMBER" | "ADMIN" | "USER";        
      }[];
    })
  | null;

export interface GraphicAccountsUsersRepository {
  create(data: Prisma.GraphicAccountUncheckedCreateInput): Promise<GraphicAccount>;
  save(data: GraphicAccount): Promise<GraphicAccount>;
  findByUserName(userName: string): Promise<GraphicAccount | null>;
  findById(id: string): Promise<GraphicAccount | null>;
}
