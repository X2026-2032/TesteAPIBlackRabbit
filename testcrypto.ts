// import forge from 'node-forge';
const forge = require("node-forge");

// Função para gerar o par de chaves RSA
export const generateRSAKeyPair = () => {
  const keypair = forge.pki.rsa.generateKeyPair(2048); // Gerando as chaves RSA
  const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
  const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
  console.log("Chave pública gerada:");
  console.log(publicKeyPem);
  console.log("Chave privada gerada:");
  console.log(privateKeyPem);

  return { privateKeyPem, publicKeyPem };
};

// Função para gerar apenas a chave privada
export const generatePrivateKey = (): string => {
  const { privateKey } = forge.pki.rsa.generateKeyPair(2048);
  return forge.pki.privateKeyToPem(privateKey);
};

// Função para criptografar mensagem com a chave pública do destinatário
// export function encryptMessage(message: any , publicKeyPem: any) {
//   const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
//   const encrypted = publicKey.encrypt(message, 'RSA-OAEP');
//   return forge.util.encode64(encrypted); // Convertendo para base64
// }
// Criptografar mensagem usando AES + RSA
export const encryptMessage = (message: string, publicKey: string) => {
  // Gerar chave AES de 256 bits
  const aesKey = forge.random.getBytesSync(32);

  // Criptografar mensagem com AES
  const cipher = forge.cipher.createCipher("AES-CBC", aesKey);
  const iv = forge.random.getBytesSync(16); // Vetor de inicialização
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(message));
  cipher.finish();
  const encryptedMessage = cipher.output.getBytes();

  // Criptografar chave AES com RSA
  const rsaPublicKey = forge.pki.publicKeyFromPem(publicKey);
  const encryptedKey = rsaPublicKey.encrypt(aesKey, "RSA-OAEP", {
    md: forge.md.sha256.create(),
  });

  // Retornar a mensagem criptografada e a chave criptografada
  return {
    encryptedMessage: forge.util.encode64(encryptedMessage),
    encryptedKey: forge.util.encode64(encryptedKey),
    iv: forge.util.encode64(iv),
  };
};

// Função para descriptografar mensagem com a chave privada do destinatário
export const decryptMessage = (
  encryptedData: { encryptedMessage: string; encryptedKey: string; iv: string },
  privateKeyPem: string,
): string => {
  // Extrair os valores do objeto
  const { encryptedMessage, encryptedKey, iv } = encryptedData;

  // Descriptografar a chave AES com RSA
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const aesKey = privateKey.decrypt(
    forge.util.decode64(encryptedKey),
    "RSA-OAEP",
    {
      md: forge.md.sha256.create(),
    },
  );

  // Descriptografar a mensagem com AES
  const decipher = forge.cipher.createDecipher("AES-CBC", aesKey);
  decipher.start({ iv: forge.util.decode64(iv) });
  decipher.update(
    forge.util.createBuffer(forge.util.decode64(encryptedMessage)),
  );
  const success = decipher.finish();

  if (!success) {
    throw new Error("Falha na descriptografia da mensagem.");
  }

  return decipher.output.toString();
};

// export const generateAndSendKeys = async (userId: string, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>, setIsSuccess: React.Dispatch<React.SetStateAction<boolean>>, setIsError: React.Dispatch<React.SetStateAction<boolean>>, setShowKeyModal: React.Dispatch<React.SetStateAction<boolean>>) => {
//   try {
//     console.log("Iniciando a geração das chaves...");
//     setIsLoading(true);

//     // Gerando as chaves RSA
//     const { publicKeyPem, privateKeyPem } = generateRSAKeyPair(); // Supondo que a função generateRSAKeyPair já esteja importada

//     console.log("Chaves geradas:", { publicKeyPem, privateKeyPem });

//     // Armazenando a chave privada no localStorage
//     console.log("Armazenando a chave privada...");
//     localStorage.setItem("privateKey", privateKeyPem);

//     // Enviando a chave pública para o backend
//     await sendPublicKeyToBackend(publicKeyPem, userId);

//     setIsSuccess(true);
//     console.log("Chave pública enviada com sucesso!");

//     // Fechar o modal após 5 segundos
//     setTimeout(() => {
//       setShowKeyModal(false);
//     }, 5000);
//   } catch (error) {
//     setIsError(true); // Indica que ocorreu um erro
//     console.error("Erro ao gerar e enviar as chaves:", error);
//     setIsLoading(false);
//   }
// };

// const token = localStorage.getItem("@backoffice:token")
// const sendPublicKeyToBackend = async (publicKeyPem: string, userId: string) => {
//   try {
//     console.log("Enviando chave pública para o backend...");
//     const response = await api.patch(
//       `/graphic/${userId}/update-publickey`,
//       { publicKey: publicKeyPem }, // Payload com a chave pública
//       {
//         headers: {
//           Authorization: `Bearer ${token}`, // Token JWT
//         },
//       }
//     );

//     console.log("Resposta do backend:", response.data);
//   } catch (error) {
//     console.error("Erro ao enviar a chave pública:", error);
//   }
// }

async function testCrypto() {
  // Mensagem de teste
  const message =
    "Mensagem secreta para testar a criptografia e descriptografia.";

  // Gerar chaves RSA para o teste (substitua por suas chaves se já tiver)
  const { publicKeyPem: publicKey, privateKeyPem: privateKey } =
    generateRSAKeyPair(); // Caso queira testar com chaves novas
  console.log("Chave pública gerada:");
  console.log(publicKey);
  console.log("Chave privada gerada:");
  console.log(privateKey);

  // Criptografar a mensagem
  const encryptedMessage = encryptMessage(message, publicKey);
  console.log("Mensagem criptografada:");
  console.log(encryptedMessage);

  // Descriptografar a mensagem
  const decryptedMessage = decryptMessage(encryptedMessage, privateKey);
  console.log("Mensagem descriptografada:");
  console.log(decryptedMessage);
}

testCrypto().catch(console.error);

// // comando de execuçao -> npx ts-node -r tsconfig-paths/register --project tsconfig.json testcrypto.ts
