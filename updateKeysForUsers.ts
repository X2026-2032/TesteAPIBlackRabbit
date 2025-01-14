import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Função para gerar o par de chaves
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048, // Tamanho da chave
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  return { publicKey, privateKey };
}

// Função para atualizar os usuários sem chaves
async function updateUsersWithKeys() {
  try {
    console.log("Buscando usuários sem chaves públicas ou privadas...");
    const users = await prisma.graphicAccount.findMany({
      where: {
        OR: [{ publicKey: null }, { privateKey: null }],
      },
    });

    if (users.length === 0) {
      console.log("Todos os usuários já possuem chaves.");
      return;
    }

    console.log(`Usuários encontrados: ${users.length}`);
    for (const user of users) {
      const { publicKey, privateKey } = generateKeyPair();
      await prisma.graphicAccount.update({
        where: { id: user.id },
        data: { publicKey, privateKey },
      });
      console.log(`Chaves geradas e salvas para o usuário: ${user.id}`);
    }

    console.log("Chaves geradas para todos os usuários sem chaves.");
  } catch (error) {
    console.error("Erro ao atualizar usuários com chaves:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar a função
updateUsersWithKeys();
