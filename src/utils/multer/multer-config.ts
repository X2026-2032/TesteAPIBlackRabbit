import multer from "fastify-multer";
import path from "path";
import fs from "fs";

// Diretórios para armazenamento dos uploads
const uploadDirUser = path.resolve(__dirname, "../../../uploads");
console.log("📂 Diretório de upload de usuários:", uploadDirUser);
const uploadDirGroup = path.resolve(__dirname, "../../../uploads-groups");
console.log("📂 Diretório de upload de grupos:", uploadDirGroup);

// Função para garantir que o diretório de upload exista
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

// Função para processar o upload do arquivo
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

    console.log(`📌 Processando upload para o usuário/grupo: ${userId}`);

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileNameWithoutExtension = `${userId}`;
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    if (!allowedExtensions.includes(fileExtension)) {
      console.error(`❌ Formato de arquivo não permitido: ${fileExtension}`);
      return cb(new Error("Formato de arquivo não permitido."));
    }

    const directoryPath = path.resolve(__dirname, uploadDir);
    ensureDirectoryExists(directoryPath); // Garante que o diretório exista

    console.log(`📂 Diretório de upload resolvido: ${directoryPath}`);

    // Verificando se a pasta de destino existe e tem permissão de escrita
    fs.access(directoryPath, fs.constants.W_OK, (err) => {
      if (err) {
        console.error(
          `❌ Sem permissão para escrever no diretório: ${directoryPath}`,
        );
        return cb(
          new Error("Sem permissão para escrever no diretório de upload."),
        );
      }
    });

    // Removendo arquivos antigos de forma assíncrona
    console.log(
      `🔍 Verificando arquivos antigos no diretório ${directoryPath}...`,
    );
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error("❌ Erro ao ler diretório:", err);
        return cb(err);
      }

      const filesToDelete = files.filter((file) =>
        file.startsWith(fileNameWithoutExtension),
      );

      console.log(`🗑 Arquivos a serem removidos: ${filesToDelete.join(", ")}`);

      filesToDelete.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`✅ Arquivo removido: ${filePath}`);
        } catch (unlinkErr) {
          console.error("❌ Erro ao excluir arquivo antigo:", unlinkErr);
        }
      });

      const finalFileName = `${fileNameWithoutExtension}${fileExtension}`;
      console.log(`✅ Novo nome de arquivo gerado: ${finalFileName}`);

      cb(null, finalFileName);
    });
  } catch (error) {
    console.error("❌ Erro inesperado em processFileUpload:", error);
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
  filename: (req, file, cb) =>
    processFileUpload(req, file, cb, "../../../uploads"),
});

// Configuração do `multer` para grupos
const storageGroup = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📌 Definindo destino do upload para grupo...");
    ensureDirectoryExists(uploadDirGroup);
    cb(null, uploadDirGroup);
  },
  filename: (req, file, cb) =>
    processFileUpload(req, file, cb, "../../../uploads-groups"),
});

// Middleware do `multer`
export const uploadUser = multer({
  storage: storageUser,
  limits: { fileSize: 10 * 1024 * 1024 },
});
export const uploadGroup = multer({
  storage: storageGroup,
  limits: { fileSize: 10 * 1024 * 1024 },
});
