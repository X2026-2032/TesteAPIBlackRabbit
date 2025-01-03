import { EventEmitter } from "events";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class NotificationsEventEmitter extends EventEmitter {
  constructor() {
    super();
  }

  async criarNotificacao(data: any) {
    try {
      const notificacao = await prisma.notifications.create({
        data: {
          ...data,
          accountId: undefined,
          graphicAccountId: undefined,
          ...(data.graphicAccountId
            ? {
                GraphicAccount: {
                  connect: {
                    id: data.graphicAccountId,
                  },
                },
              }
            : {}),
          ...(data.accountId
            ? {
                Account: {
                  connect: {
                    id: data.accountId,
                  },
                },
              }
            : {}),

          created_at: new Date(),
        },
      });
      return notificacao;
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      throw error;
    }
  }
}

const notificationsEmitter = new NotificationsEventEmitter();

export default notificationsEmitter;
