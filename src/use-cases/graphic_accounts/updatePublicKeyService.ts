import { prisma } from "@/lib/prisma";

export async function updatePublicKeyService(userName: string, publicKey: string) {
  try {
    // Atualizar a chave pública no banco de dados
    const updatedAccount = await prisma.graphicAccount.update({
      where: { userName },
      data: { publicKey },
    });

    return updatedAccount;
  } catch (error) {
    console.error("Erro no serviço ao atualizar a chave pública:", error);
    throw new Error("Erro ao atualizar a chave pública.");
  }
}
