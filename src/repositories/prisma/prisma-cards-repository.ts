import { Card, Prisma, PrismaClient } from "@prisma/client";
import { CardsRepository } from "../cards-repository";

export class PrismaCardsRepository implements CardsRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  findById(id: string): Promise<Card | null> {
    try {
      return this.prisma.card.findFirst({
        where: { id },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Falha ao criar a recarga do telefone!");
    }
  }

  updateStatus(params: { id: string; status: string }): Promise<Card | null> {
    try {
      return this.prisma.card.update({
        where: { id: params.id },
        data: { status: params.status },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Falha ao criar a recarga do telefone!");
    }
  }

  async create(data: Prisma.CardCreateInput): Promise<Card> {
    try {
      return this.prisma.card.create({
        data,
      });
    } catch (error) {
      console.log(error);
      throw new Error("Falha ao criar a recarga do telefone!");
    }
  }
}
