export class IdezBankTransferReceivedBuild {
  static execute(data: any) {
    return {
      id: data.id,
      amount: +data.amount,
      direction: data.direction,
      account_id: data.account_id,
      payer: {
        name: data.beneficiary_name,
        document: data.beneficiary.holder.document,
        bank_account: {
          branch: data.beneficiary.holder.branch,
          bank_name: data.beneficiary.holder.bank_name,
          account_number: data.beneficiary.holder.account_number,
          account_digit: data.beneficiary.holder.account_digit,
        },
      },
    };
  }
}
