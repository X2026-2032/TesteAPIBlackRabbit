import {
  DailyFinalBalance,
  dailyFinalBalanceRepository,
} from "@/repositories/prisma/daily-final-balance-repository";

export const getDailyFinalBalances = async (
  userId: string,
): Promise<DailyFinalBalance[]> => {
  // Adicionando userId como argumento
  try {
    const dailyFinalBalances = await dailyFinalBalanceRepository.findAll(
      userId,
    ); // Passando userId para o repositório
    return dailyFinalBalances;
  } catch (error) {
    throw new Error("Failed to retrieve daily final balances");
  }
};
