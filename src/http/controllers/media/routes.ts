import { FastifyInstance } from "fastify";
import multer from "fastify-multer";
import path from "path";
import fs from "fs";
import { updateProfilePicture } from "./update-profile-picture";
import { verifyJwt } from "@/http/middlewares/verify-jwt";
import { getProfilePicture } from "./get-profile-picture";
import { getAllProfilePictures } from "./get-all-profile-picture-controller";

// Configura o multer corretamente para o Fastify
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"), // Pasta de destino
  filename: (req, file, cb) => {
    const userId = req.params.id; // Obtém o ID do usuário da URL
    const fileExtension = path.extname(file.originalname).toLowerCase(); // Obtém a extensão do arquivo (em minúsculas)
    const fileNameWithoutExtension = `${userId}`; // Nome do arquivo baseado no ID do usuário (sem extensão)

    // Verifica se a extensão do arquivo é permitida
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']; // Extensões permitidas
    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error("Formato de arquivo não permitido."));
    }

    // Caminho completo para procurar arquivos com o mesmo ID
    const directoryPath = path.join(__dirname, "../../uploads");
    
    // Procurar todos os arquivos com o mesmo ID, independentemente da extensão
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error("Erro ao ler diretório:", err);
        return cb(err);
      }

      // Filtra os arquivos que começam com o userId
      const filesToDelete = files.filter(file => file.startsWith(fileNameWithoutExtension));

      // Remove todos os arquivos encontrados com o mesmo ID (ignorando a extensão)
      filesToDelete.forEach(file => {
        const filePath = path.join(directoryPath, file);
        fs.unlinkSync(filePath); // Remove o arquivo
      });

      // Salva o novo arquivo com o nome baseado no ID do usuário e com a extensão original
      cb(null, `${fileNameWithoutExtension}${fileExtension}`);
    });
  },
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 }  // Limite de tamanho do arquivo (10MB)
});

export async function MediaRoutes(app: FastifyInstance) {
 // app.addHook("onRequest", verifyJwt);

  // Rota para buscar todas as imagens de perfil dos contatos
  app.get("/get-all-profile-pictures/:id", getAllProfilePictures);

  // Rota para buscar a imagem de perfil de um contato
  app.get("/get-profile-picture/:id", getProfilePicture);

  // Rota para atualizar a imagem do perfil
  app.post("/update-profile-picture/:id", { preHandler: upload.single("file") }, async (request, reply) => {
    if (!request.file) {
      return reply.status(400).send({ message: "Nenhum arquivo enviado." });
    }

    const fileName = (request.file && request.file.filename) || ""; // Garantindo que 'filename' existe
    const filePath = `/uploads/${fileName}`; // Caminho correto do arquivo salvo

    if (!fileName) {
      return reply.status(400).send({ message: "Falha ao processar o arquivo." });
    }

    return reply.send({
      message: "Imagem de perfil atualizada com sucesso!",
      filePath,
    });
  });
}
