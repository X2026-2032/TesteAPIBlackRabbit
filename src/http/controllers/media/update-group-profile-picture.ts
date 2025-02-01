// import { AppError } from "@/use-cases/errors/app-error";
// import { FastifyReply, FastifyRequest } from "fastify";
// import path from "path";
// import fs from "fs";
// import { MediaGroupServices } from "@/use-cases/media/groups-service";

// interface RequestParams {
//   id: string;
// }

// export async function updateGroupProfilePicture(
//   request: FastifyRequest,
//   reply: FastifyReply,
//   file: any
// ) {
//   console.log("[Controller] Iniciando o método `updateProfilePicture`");

   
     
  
//       // // Define o caminho de armazenamento para o arquivo
//       // const filePath = path.join(process.cwd(), "uploads", file.filename);
//       // const fileStream = fs.createWriteStream(filePath);
  
//       // // Salva o arquivo
//       // file.pipe(fileStream);
  
//   try {
//     // Obtem os parâmetros da requisição
//     const params = request.params as RequestParams;

//     // Obtém o arquivo usando a função file() do fastify-multipart
//     const file = await request.file(); // Corrige para chamar a função assíncrona
//     if (!file) {
//       console.error("[Controller] Nenhum arquivo enviado.");
//       return reply.status(400).send({ message: "File is required." });
//     }
//     console.log("[Controller] Arquivo recebido:", file.filename, file.mimetype);

//     // Verifica se o ID foi fornecido nos parâmetros
//     if (!params.id) {
//       console.error("[Controller] ID não fornecido nos parâmetros");
//       return reply.status(400).send({ message: "User ID is required." });
//     }
//     console.log("[Controller] ID do usuário:", params.id);

//     // Diretório de upload
//     const uploadDir = path.join(process.cwd(), "uploads", "avatars");
//     console.log("[Controller] Diretório de upload:", uploadDir);

//     // Obter a extensão do arquivo
//     const fileExtension = getFileExtension(file.mimetype); // Corrigido para usar file.mimetype
//     console.log("[Controller] Extensão do arquivo:", fileExtension);

//     const uploadPath = path.join(uploadDir, `${params.id}${fileExtension}`);
//     console.log("[Controller] Caminho para salvar o arquivo:", uploadPath);

//     // Verifica e cria o diretório, se necessário
//     if (!fs.existsSync(uploadDir)) {
//       console.log("[Controller] Diretório não existe. Criando diretório...");
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     // Remove arquivo existente, se houver
//     if (fs.existsSync(uploadPath)) {
//       console.log("[Controller] Arquivo já existe. Deletando o arquivo anterior...");
//       fs.unlinkSync(uploadPath);
//     }

//     // Salva o arquivo no disco
//     console.log("[Controller] Iniciando a escrita do arquivo...");
//     await file.toBuffer().then((buffer) => fs.writeFileSync(uploadPath, buffer));
//     console.log("[Controller] Arquivo salvo com sucesso:", uploadPath);

//     // Atualiza a URL no banco de dados
//     const mediaServices = new MediaGroupServices();
//     const url = `/uploads/avatars/${params.id}${fileExtension}`;
//     console.log("[Controller] URL da imagem:", url);

//     const response = await mediaServices.update({
//       userId: params.id,
//       url,
//     });
//     console.log("[Controller] Resposta do serviço:", response);

//     return reply.status(201).send({ avatarUrl: url });
//   } catch (error: any) {
//     console.error("[Controller] Erro capturado:", error);
//     throw new AppError(error);
//   }
// }

// // Função para obter a extensão do arquivo com base no tipo MIME
// function getFileExtension(mimeType: string): string {
//   console.log("[Controller] Verificando o tipo MIME:", mimeType);
//   switch (mimeType) {
//     case "image/jpeg":
//       return ".jpg";
//     case "image/png":
//       return ".png";
//     case "image/gif":
//       return ".gif";
//     default:
//       console.error("[Controller] Tipo de arquivo não suportado:", mimeType);
//       throw new AppError({ message: "Unsupported file type." });
//   }
// }
