export interface WebHookPagBank {
  transaction: {
    date: string[];
    code: string[];
    type: string[];
    status: string[];
    lastEventDate: string[];
    paymentMethod: PaymentMethod[];
    grossAmount: string[];
    discountAmount: string[];
    creditorFees: CreditorFees[];
    netAmount: string[];
    extraAmount: string[];
    escrowEndDate: string[];
    installmentCount: string[];
    itemCount: string[];
    items: Item[];
    primaryReceiver: PrimaryReceiver[];
    deviceInfo: DeviceInfo[];
    liquidation: Liquidation[];
  };
}

interface PaymentMethod {
  type: string[];
  code: string[];
}

interface CreditorFees {
  installmentFeeAmount: string[];
  intermediationRateAmount: string[];
  intermediationFeeAmount: string[];
}

interface Item {
  item: InnerItem[];
}

interface InnerItem {
  id: string[];
  description: string[];
  quantity: string[];
  amount: string[];
}

interface PrimaryReceiver {
  publicKey: string[];
}

interface DeviceInfo {
  reference: string[];
  bin: string[];
  holder: string[];
  serialNumber: string[];
}

interface Liquidation {
  contractType: string[];
  contractDescription: string[];
}
