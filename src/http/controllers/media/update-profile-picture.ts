import { AppError } from "@/use-cases/errors/app-error";
import { MediaServices } from "@/use-cases/media";
import { FastifyReply, FastifyRequest } from "fastify";

interface RequestBody {
  url: string;
}

interface RequestParams {
  id: string;
}

export async function updateProfilePicture(
  request: FastifyRequest,
  reply: FastifyReply
) {
  console.log("[Controller] Iniciando o método `updateProfilePicture`");

  try {
    console.log("[Controller] Validando corpo da requisição...");
    const requestBody = request.body as RequestBody;
    console.log("[Controller] Corpo da requisição:", requestBody);

    console.log("[Controller] Validando parâmetros da requisição...");
    const params = request.params as RequestParams;
    console.log("[Controller] Parâmetros da requisição:", params);

    if (!requestBody.url) {
      console.error("[Controller] URL não fornecida no corpo da requisição");
      return reply.status(400).send({ message: "URL is required." });
    }

    if (!params.id) {
      console.error("[Controller] ID não fornecido nos parâmetros");
      return reply.status(400).send({ message: "User ID is required." });
    }

    console.log("[Controller] Instanciando serviço de mídia...");
    const mediaServices = new MediaServices();

    console.log("[Controller] Chamando o serviço `update` com os dados:", {
      url: requestBody.url,
      userId: params.id,
    });

    const response = await mediaServices.update({
      url: requestBody.url,
      userId: params.id,
    });

    console.log("[Controller] Resposta do serviço:", response);

    console.log("[Controller] Enviando resposta ao cliente com status 201");
    return reply.status(201).send(response);
  } catch (error: any) {
    console.error("[Controller] Erro capturado:", error);
    throw new AppError(error);
  }
}
