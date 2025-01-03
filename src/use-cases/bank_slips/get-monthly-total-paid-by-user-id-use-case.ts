import { BankSlipRepository } from "@/repositories/bank-slip-repository";

export class GetMonthlyTotalPaidByUserIdUseCase {
  constructor(private bankSlipRepository: BankSlipRepository) {}

  async execute(userId: string): Promise<number> {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const bankSlips = await this.bankSlipRepository.findByUserId(userId);
    const totalPaid = bankSlips
      .filter((bankSlip) => {
        const createdDate = new Date(bankSlip.created_at || "");
        return (
          createdDate.getMonth() + 1 === currentMonth &&
          createdDate.getFullYear() === currentYear
        );
      })
      .reduce((total, bankSlip) => total + bankSlip.amount, 0);

    return totalPaid;
  }
}
