// types.ts
interface QRCodeData {
  type: string;
  keyType: string;
  key: string;
  id_tx: string | null;
  date_expiration: string;
  allow_change: boolean;
  payer: {
    name: string;
    document: string;
    question: string;
  };
  due_date: string; // ou Date, dependendo do formato que você estiver utilizando
  limit_days: number;
  amount: number;
  discount: {
    amount: number;
    type: string;
  };
  rebate: {
    amount: number;
    type: string;
  };
  fine: {
    amount: number;
    type: string;
  };
  interest: {
    amount: number;
    type: string;
  };
  detail: {
    title: string | null;
    content: string | null;
  };
}

export type PixTransferDelBankResponse = {
  id: string;
  nsu: number;
  amount: number;
  notes: string;
  createdAt: string;
  type: string;
  endToEndId: string;
  transactionType: {
    name: string;
    description: string;
    isCredit: boolean;
  };
  modality: string;
  balance: {
    balancePrevious: number;
    currentBalance: number;
  };
  proof: {
    id: string;
    endToEndId: string;
    status: string;
    type: string;
    amount: number;
    description: string;
    payer: {
      number: string;
      branch: string;
      type: string;
      holder: {
        document: string;
        name: string;
        type: string;
      };
      participant: {
        name: string;
        ispb: string;
      };
    };
    beneficiary: {
      number: string;
      branch: string;
      type: string;
      holder: {
        document: string;
        name: string;
        type: string;
      };
      participant: {
        name: string;
        ispb: string;
      };
    };
  };
};

export type VeriffSuccessType = {
  status: string;
  verification: {
    id: string;
    code: number;
    person: {
      gender: any;
      idNumber: any;
      lastName: string;
      firstName: string;
      citizenship: any;
      dateOfBirth: string;
      nationality: any;
      yearOfBirth: any;
      placeOfBirth: any;
      pepSanctionMatch: any;
    };
    reason: any;
    status: string;
    comments: Array<any>;
    document: {
      type: string;
      number: string;
      country: string;
      validFrom: string;
      validUntil: string;
    };
    reasonCode: any;
    vendorData: any;
    decisionTime: string;
    acceptanceTime: string;
    // eslint-disable-next-line @typescript-eslint/ban-types
    additionalVerifiedData: {};
  };
  technicalData: {
    ip: string;
  };
};

const PagBankPaymentStatus = {
  ANALYSIS: 2,
  COMPLETE: 3,
  DONE: 4,
  REFOUND: 8,
  RETURNED: 6,
  CANCELED: 7,
};

interface TransactionDetailsSentToJson {
  nsu: number;
  amount: number;
  createdAt: number;
}
interface FailedTransactionDetailsByUser {
  userId: string;
  webTransactionCount: number;
  transactions: TransactionDetailsSentToJson[];
}

type TED = {
  id: string;
  nsu: number;
  amount: number;
  notes: string;
  createdAt: string;
  type: {
    name: string;
    description: string;
    isCredit: boolean;
  };
  balance: {
    balancePrevious: number;
    currentBalance: number;
  };
  proof: {
    id: string;
    status: string;
    type: string;
    amount: number;
    description: string;
    payer: Array<any>;
    beneficiary: Array<any>;
  };
};

export {
  QRCodeData,
  PagBankPaymentStatus,
  TransactionDetailsSentToJson,
  FailedTransactionDetailsByUser,
  TED,
};
