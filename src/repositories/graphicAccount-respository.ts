import { GraphicAccount, Prisma } from "@prisma/client";

export type GraphicAccountUser =
  | (GraphicAccount & {
      GraphicAccountUser: {
        id: string;
        name: string | null;
        userName: string | null;
        hardPassword: string | null;
        password: string | number | null;
        status: string | null;
        created_at: Date;
        access_token: string | null;
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
