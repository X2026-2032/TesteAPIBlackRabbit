import { prisma } from "@/lib/prisma";

interface UpdateUserStatusInput {
  userId: string;
  newStatus: string;
  newApiKey: string;
}

interface UpdateUserStatusOutput {
  success: boolean;
  message?: string;
  updatedUser?: any;
}

class UpdateUserStatusUseCase {
  async execute(input: UpdateUserStatusInput): Promise<UpdateUserStatusOutput> {
    try {
      const { userId, newStatus, newApiKey } = input;

      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return { success: false, message: "Usuário não encontrado" };
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          status: newStatus,
          api_key: newApiKey,
        },
      });

      return { success: true, updatedUser };
    } catch (error) {
      console.error("Erro ao atualizar o status do usuário:", error);
      return {
        success: false,
        message: "Erro ao atualizar o status do usuário",
      };
    }
  }
}

export { UpdateUserStatusUseCase };
