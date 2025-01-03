import { prisma } from "@/lib/prisma";

export class MediaServices {
  async list({ userId }: { userId: string }) {
    console.log("[MediaServices] Iniciando método `list`");
    try {
      const picures = {
        current: "",
        second: "",
      };

      console.log(`[MediaServices] Buscando usuário com ID: ${userId}`);
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      console.log(`[MediaServices] Buscando graphicAccount com ID: ${userId}`);
      const wallet = await prisma.graphicAccount.findUnique({
        where: {
          id: userId,
        },
      });

      if (user) {
        console.log("[MediaServices] Usuário encontrado. Buscando imagens relacionadas...");
        const currentPicure = await prisma.pictures.findFirst({
          where: { user_id: user.id },
        });

        picures.current = currentPicure?.url || "";
        console.log("[MediaServices] Imagem atual do usuário:", picures.current);

        const graphicAccountId = await prisma.graphicAccount.findFirst({
          where: { id_master_user: user.id },
        });

        if (graphicAccountId) {
          console.log("[MediaServices] Buscando imagem da graphicAccount...");
          const secondPicure = await prisma.pictures.findFirst({
            where: { graphic_account_id: graphicAccountId.id },
          });
          picures.second = secondPicure?.url || "";
          console.log("[MediaServices] Imagem secundária encontrada:", picures.second);
        }
      }

      if (wallet) {
        console.log("[MediaServices] Wallet encontrada. Buscando imagens relacionadas...");
        const currentPicure = await prisma.pictures.findFirst({
          where: { graphic_account_id: wallet.id },
        });

        picures.current = currentPicure?.url || "";
        console.log("[MediaServices] Imagem atual do wallet:", picures.current);

        if (wallet.id_master_user) {
          const master_user = await prisma.user.findFirst({
            where: { id: wallet.id_master_user },
          });

          if (master_user) {
            console.log("[MediaServices] Master user encontrado. Buscando imagem secundária...");
            const secondPicure = await prisma.pictures.findFirst({
              where: { user_id: master_user.id },
            });
            picures.second = secondPicure?.url || "";
            console.log("[MediaServices] Imagem secundária encontrada:", picures.second);
          }
        }
      }

      console.log("[MediaServices] Retornando imagens:", picures);
      return picures;
    } catch (error) {
      console.error("[MediaServices] Erro no método `list`:", error);
      throw error;
    }
  }

  async update({ userId, url }: { userId: string; url: string }) {
    console.log("[MediaServices] Iniciando método `update`");
    console.log(`[MediaServices] Dados recebidos: userId=${userId}, url=${url}`);

    try {
      let user;

      console.log(`[MediaServices] Buscando usuário com ID: ${userId}`);
      user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (user) {
        console.log("[MediaServices] Usuário encontrado. Atualizando imagens...");
        await prisma.pictures.deleteMany({
          where: {
            user_id: userId,
          },
        });
        console.log("[MediaServices] Imagens antigas deletadas para o usuário.");

        await prisma.pictures.create({
          data: {
            url,
            user_id: userId,
          },
        });
        console.log("[MediaServices] Nova imagem criada para o usuário.");
      } else {
        console.log("[MediaServices] Usuário não encontrado. Verificando graphicAccount...");
        user = await prisma.graphicAccount.findUnique({
          where: {
            id: userId,
          },
        });

        if (!user) {
          console.error("[MediaServices] Usuário ou graphicAccount não encontrado.");
          throw new Error("User or Graphic Account not found");
        }

        console.log("[MediaServices] GraphicAccount encontrada. Atualizando imagens...");
        await prisma.pictures.deleteMany({
          where: {
            graphic_account_id: userId,
          },
        });
        console.log("[MediaServices] Imagens antigas deletadas para a graphicAccount.");

        await prisma.pictures.create({
          data: {
            url,
            graphic_account_id: userId,
          },
        });
        console.log("[MediaServices] Nova imagem criada para a graphicAccount.");
      }

      console.log("[MediaServices] Retornando usuário/graphicAccount atualizado.");
      return user;
    } catch (error) {
      console.error("[MediaServices] Erro no método `update`:", error);
      throw error;
    }
  }
}
