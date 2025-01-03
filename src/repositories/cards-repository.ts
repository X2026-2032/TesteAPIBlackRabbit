import { Prisma, Card } from "@prisma/client";

export interface CardsRepository {
  create(data: Prisma.CardCreateInput): Promise<Card>;
  findById(id: string): Promise<Card | null>;
  updateStatus(params: { id: string; status: string }): Promise<Card | null>;
}
