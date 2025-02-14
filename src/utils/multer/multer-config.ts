import multer from "fastify-multer";
import path from "path";
import fs from "fs";

// Diretórios para armazenamento dos uploads
const uploadDirUser = path.resolve(__dirname, "../../../uploads");
const uploadDirGroup = path.resolve(__dirname, "../../../uploads-groups");

// Função para garantir que o diretório de upload exista
function ensureDirectoryExists(directoryPath: string) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

async function processFileUpload(
  req: any,
  file: any,
  cb: (error: Error | null, filename?: string) => void,
  uploadDir: string,
) {
  try {
    const userId = req.params?.id;
    if (!userId) {
      return cb(new Error("ID do usuário/grupo não encontrado na URL."));
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileNameWithoutExtension = `${userId}`;
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error("Formato de arquivo não permitido."));
    }

    const directoryPath = path.resolve(__dirname, uploadDir);
    ensureDirectoryExists(directoryPath);

    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return cb(err);
      }

      const filesToDelete = files.filter((file) =>
        file.startsWith(fileNameWithoutExtension),
      );

      filesToDelete.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.error("Erro ao excluir arquivo antigo:", unlinkErr);
        }
      });

      const finalFileName = `${fileNameWithoutExtension}${fileExtension}`;
      cb(null, finalFileName);
    });
  } catch (error) {
    cb(error as Error);
  }
}

const storageUser = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirectoryExists(uploadDirUser);
    cb(null, uploadDirUser);
  },
  filename: (req, file, cb) =>
    processFileUpload(req, file, cb, "../../../uploads"),
});

const storageGroup = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDirectoryExists(uploadDirGroup);
    cb(null, uploadDirGroup);
  },
  filename: (req, file, cb) =>
    processFileUpload(req, file, cb, "../../../uploads-groups"),
});

export const uploadUser = multer({
  storage: storageUser,
  limits: { fileSize: 10 * 1024 * 1024 },
});
export const uploadGroup = multer({
  storage: storageGroup,
  limits: { fileSize: 10 * 1024 * 1024 },
});
