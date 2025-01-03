import { RegisterIndividualsDocumentsUseCase } from "../register-individuals/register-individuals-documents";

export function makeRegisterIndividualsDocumentst() {
  return new RegisterIndividualsDocumentsUseCase();
}
