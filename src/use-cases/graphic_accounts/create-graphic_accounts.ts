import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { GraphicAccountsUsersRepository } from "@/repositories/graphicAccount-respository";

interface CreateGrapicAccountUseCaseRequest {
  name?: string;
  userName?: string;
  hardPassword?: string;
  password_hash?: string;
  status?: string;
  created_at: Date;
  access_token?: string;
  blocked: boolean;
  counter: number;
  role: "MEMBER" | "ADMIN" | "USER";
}

export class CreateGrapicAccountUseCase {
  constructor(private repository: GraphicAccountsUsersRepository) {}

  public async execute({
    name,
    userName,
    hardPassword,
    password_hash,
    status,
    created_at,
    access_token,
    blocked,
    counter,
    role,
  }: CreateGrapicAccountUseCaseRequest) {
    try {
      console.log("Iniciando o método execute...");
      console.log("Parâmetros recebidos:", {
        name,
        userName,
        hardPassword,
        password_hash,
        status,
        created_at,
        access_token,
        blocked,
        counter,
        role,
      });

      // Verificar se o usuário já existe
      console.log("Verificando se o usuário já existe no banco de dados...");
      const users = await prisma.graphicAccount.findFirst({
        where: { userName },
      });

      if (users) {
        console.error("Erro: userName já cadastrado.");
        throw new Error("userName já cadastrado.");
      }

      // Gerar o hash da senha
      console.log("Gerando o hash da senha...");
      const hashedPassword = await hash(password_hash as string, 6);
      console.log("Senha hash gerada com sucesso:", hashedPassword);

      // Criar o gráfico da conta
      console.log("Criando o registro no banco de dados...");
      const graphicAccount = await prisma.graphicAccount.create({
        data: {
          name,
          userName, // Agora 'userName' é obrigatório
          status: status || "active", // Ajuste se o status não for fornecido
          password_hash: hashedPassword, // Usa o hash gerado
          counter,
          blocked,
          role,
          created_at,
          hardPassword, // Opcional, apenas se necessário
          access_token,
        },
      });

      console.log("Registro criado com sucesso:", graphicAccount);

      // Retornar os dados sem o hash da senha
      const result = { ...graphicAccount, password_hash: undefined };
      console.log("Resultado final a ser retornado:", result);

      return result;
    } catch (error) {
      console.error("Erro durante a execução do método execute:", error);
      throw error; // Repropagar o erro para ser tratado em outro lugar
    }
  }
}
