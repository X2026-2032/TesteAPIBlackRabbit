export class IdezPixReceivedBuild {
  static execute(data: any) {
    return {
      idTx: data.id_tx,
      method_qr_code: data.method,
      status: data.status,
      id: data.id,
      amount: +data.amount,
      direction: data.direction,
      account_id: data.account_id,
      payer: {
        key: data.payer_payee.key,
        name: data.payer_payee.bank_account.name,
        bank_account: {
          branch: data.payer_payee.bank_account.branch,
          bank_name: data.payer_payee.bank_account.bank_name,
          account_number: data.payer_payee.bank_account.account_number,
          account_digit: data.payer_payee.bank_account.account_digit,
        },
      },
    };
  }
}
