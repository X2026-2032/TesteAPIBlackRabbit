import { QRCodeData } from "@/@types/types";

class QRCodeRepository {
  constructor() {
    // Inicialize o repositório se necessário
  }

  generateQRCode(qrCodeData: QRCodeData) {
    const { type, key, id_tx, payer, date_expiration, allow_change, detail } =
      qrCodeData;

    if (
      !type ||
      !key ||
      !id_tx ||
      !payer ||
      !date_expiration ||
      !allow_change
    ) {
      throw new Error("Dados insuficientes para gerar o QR Code.");
    }

    // Valide os dados do QR Code de acordo com as especificações e gere o QR Code de acordo com os valores fornecidos
    const generatedQRCode = {
      type: type,
      key: key,
      id_tx: id_tx,
      payer: payer,
      date_expiration: date_expiration,
      allow_change: allow_change,
      detail: detail,
    };

    // Retorne os dados do QR Code gerado ou faça outras operações necessárias
    return generatedQRCode;
  }
}

export { QRCodeRepository };
