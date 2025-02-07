import multer from "fastify-multer";
import path from "path";
import fs from "fs";
function processFileUpload(req: any, file: any, cb: any, uploadDir: string) {
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

  const directoryPath = path.join(__dirname, uploadDir);

  // Verifica se o diretório existe, se não, cria
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  // Lê os arquivos do diretório e remove arquivos antigos
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return cb(err);
    }

    const filesToDelete = files.filter((file) =>
      file.startsWith(fileNameWithoutExtension),
    );

    filesToDelete.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      fs.unlinkSync(filePath);
    });

    const finalFileName = `${fileNameWithoutExtension}${fileExtension}`;

    cb(null, finalFileName);
  });
}

const storageUser = multer.diskStorage({
  destination: path.join(__dirname, "../../../uploads"),
  filename: (req, file, cb) =>
    processFileUpload(req, file, cb, "../../../uploads"),
});

const storageGroup = multer.diskStorage({
  destination: path.join(__dirname, "../../../uploads-groups"),
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
