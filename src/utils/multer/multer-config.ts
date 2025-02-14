import multer from "fastify-multer";
import path from "path";
import fs from "fs";

// Diretórios para armazenamento
const uploadDirUser = path.resolve(__dirname, "../../../uploads");
const uploadDirGroup = path.resolve(__dirname, "../../../uploads-groups");

console.log("📂 Diretório de upload de usuários:", uploadDirUser);
console.log("📂 Diretório de upload de grupos:", uploadDirGroup);

// Função para garantir que o diretório exista
function ensureDirectoryExists(directoryPath: string) {
  try {
    if (!fs.existsSync(directoryPath)) {
      console.log(`📂 Diretório ${directoryPath} não existe. Criando...`);
      fs.mkdirSync(directoryPath, { recursive: true });
      console.log(`✅ Diretório ${directoryPath} criado com sucesso.`);
    } else {
      console.log(`✔ Diretório ${directoryPath} já existe.`);
    }
  } catch (error) {
    console.error(
      `❌ Erro ao verificar/criar diretório ${directoryPath}:`,
      error,
    );
  }
}

// Função para processar o upload
async function processFileUpload(
  req: any,
  file: any,
  cb: (error: Error | null, filename?: string) => void,
  uploadDir: string,
) {
  try {
    const userId = req.params?.id;
    if (!userId) {
      console.error("❌ ID do usuário/grupo não encontrado na URL.");
      return cb(new Error("ID do usuário/grupo não encontrado na URL."));
    }

    console.log(`📌 Processando upload para: ${userId}`);

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    if (!allowedExtensions.includes(fileExtension)) {
      console.error(`❌ Formato de arquivo não permitido: ${fileExtension}`);
      return cb(new Error("Formato de arquivo não permitido."));
    }

    const directoryPath = uploadDir;
    ensureDirectoryExists(directoryPath);

    console.log(`📂 Diretório resolvido: ${directoryPath}`);

    // Garantir permissões de escrita
    try {
      await fs.promises.access(directoryPath, fs.constants.W_OK);
    } catch (err) {
      console.error(`❌ Sem permissão para escrever em ${directoryPath}`);
      return cb(new Error("Sem permissão para escrever no diretório."));
    }

    // Remover arquivos antigos
    console.log(`🔍 Limpando arquivos antigos em ${directoryPath}...`);
    const files = await fs.promises.readdir(directoryPath);
    const userFilePrefix = `${userId}`;

    await Promise.all(
      files
        .filter((file) => file.startsWith(userFilePrefix))
        .map(async (file) => {
          const filePath = path.join(directoryPath, file);
          try {
            await fs.promises.unlink(filePath);
            console.log(`🗑 Arquivo removido: ${filePath}`);
          } catch (unlinkErr) {
            console.error("❌ Erro ao excluir arquivo antigo:", unlinkErr);
          }
        }),
    );

    const finalFileName = `${userId}${fileExtension}`;
    console.log(`✅ Nome do novo arquivo: ${finalFileName}`);

    cb(null, finalFileName);
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
    cb(error as Error);
  }
}

// Configuração do `multer` para usuários
const storageUser = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📌 Definindo destino do upload para usuário...");
    ensureDirectoryExists(uploadDirUser);
    cb(null, uploadDirUser);
  },
  filename: (req, file, cb) => processFileUpload(req, file, cb, uploadDirUser),
});

// Configuração do `multer` para grupos
const storageGroup = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📌 Definindo destino do upload para grupo...");
    ensureDirectoryExists(uploadDirGroup);
    cb(null, uploadDirGroup);
  },
  filename: (req, file, cb) => processFileUpload(req, file, cb, uploadDirGroup),
});

// Middleware `multer`
export const uploadUser = multer({
  storage: storageUser,
  limits: { fileSize: 10 * 1024 * 1024 },
});
export const uploadGroup = multer({
  storage: storageGroup,
  limits: { fileSize: 10 * 1024 * 1024 },
});
