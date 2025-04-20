import { prisma } from "@/lib/prisma";
export async function findHardCoded(content: string) {
  console.log("content", content);
  // Cria um registro de GroupMember para o dono do grupo
  const hardCoded = await prisma.hardCoded.findFirst({
    where: { content: content },
  });

  if (!hardCoded) {
    throw new Error("hardCoded não encontrado");
  }

  return { success: true, message: "content encontrado" };
}
