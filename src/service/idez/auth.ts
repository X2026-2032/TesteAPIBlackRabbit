{
  /*
import { api } from "@/lib/axios";
import { IdezErrors } from "./idez-errors";

export type IdezAuthServiceRequest = {
  document: string;
  password: string;
};

export class IdezAuthService {
  public async execute(data: IdezAuthServiceRequest) {
    try {
      const response = await api.post("/auth", {
        username: data.document,
        password: data.password,
        device: "api",
      });
      return response.data;
    } catch (error) {
      throw new IdezErrors().message(error);
    }
  }
}
 */
}

///////////////////////////////////////////////////////////

// auth.ts
{
  /*
import { IdezErrors } from "./idez-errors";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

export type IdezAuthServiceRequest = {
  document: string;
  password: string;
};

export class IdezAuthService {
  public async execute(data: IdezAuthServiceRequest) {
    try {
      // Verifica as credenciais no banco de dados
      const user = await prisma.user.findUnique({
        where: {
          document: data.document,
        },
      });

      if (!user || !user.password) {
        // Usuário não encontrado ou sem senha
        throw new Error("Invalid credentials");
      }

      // Agora, você pode comparar as senhas, por exemplo, usando bcrypt
      const isPasswordValid = compare(data.password, user.password);

      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      // Retorna os dados do usuário, ou o que for necessário
      return {
        user: user,
        // Adicione outros dados que você deseja retornar
      };
    } catch (error) {
      throw new IdezErrors().message(error);
    }
  }
}
*/
}

///////////////////////////////
{
  /*
import { api } from "@/lib/axios";
import { IdezErrors } from "./idez-errors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type IdezAuthServiceRequest = {
  document: string;
  password: string;
};

export class IdezAuthService {
  public async execute(data: IdezAuthServiceRequest) {
    try {
      // Consulta o banco de dados para obter informações do usuário
      const user = await prisma.user.findUnique({
        where: {
          document: data.document,
        },
      });

      if (!user) {
        // Trate o caso em que o usuário não é encontrado
        throw new IdezErrors().message("User not found");
      }

      // Realize as verificações de senha ou outras lógicas conforme necessário
      const isValidPassword = user.password === data.password;
      if (!isValidPassword) {
        throw new IdezErrors().message("Invalid credentials");
      }

      // Agora, você pode gerar um novo token de acesso com base nas informações do usuário
      const accessToken = this.generateAccessToken(user.id);

      // Retorna o token gerado
      return { access_token: accessToken };
    } catch (error) {
      throw new IdezErrors().message(error);
    }
  }

  private generateAccessToken(userId: string) {
    // Lógica para gerar um token de acesso semelhante à anterior
    // ...

    return "novotoken";  // Substitua por sua lógica real de geração de token
  }
}
*/
}

{
  /*
import { api } from "@/lib/axios";
import { IdezErrors } from "./idez-errors";
import { PrismaClient } from '@prisma/client';
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sign } from "jsonwebtoken"; // Importa a função 'sign' do jsonwebtoken


export type IdezAuthServiceRequest = {
  document: string;
  password: string;
};

export class IdezAuthService {
  private static readonly JWT_SECRET = "MySecret"; // Substitua com um segredo real

  private static generateAccessToken(userId: string) {
    // Gera um token JWT com o ID do usuário
    return sign({ userId }, IdezAuthService.JWT_SECRET, { expiresIn: '30d' });
  }

  public async internalAuthenticate(data: IdezAuthServiceRequest) {
    try {
      // Consultar o banco de dados para encontrar o usuário com base no documento
      const user = await prisma.user.findUnique({
        where: {
          document: data.document,
        },
        include: {
          Account: true, // Inclui o relacionamento com a conta
        },
      });

      
      if (!user || user.password === null || !(await compare(data.password, user.password))) {
        // Usuário não encontrado, senha nula ou senha incorreta
        throw new Error('Invalid credentials');
      }

       // Gera um token JWT
      const accessToken = IdezAuthService.generateAccessToken(user.id);

       // Atualiza o usuário no banco de dados com o novo token
       await prisma.user.update({
         where: { id: user.id },
         data: { access_token: accessToken },
       });

      // Se a autenticação for bem-sucedida, você pode retornar um objeto
      // contendo informações relevantes sobre o usuário
      return {
        token: {
          acessToken: user.access_token,
        },
        userId: user.id,
        username: user.name,
        document: user.document,
        email: user.email,
  password: user.password,
  phone: { number: user.phone, "type": "mobile" },
  role: user.role,
  status: user.status,
  type: user.type,
  refId: user.refId,
  access_token: user.access_token,
  company_type: user.company_type,
  // Adicionando a conta associada ao usuário, se existir
account: user.Account, // Agora deve ser acessado usando user.Account
  // ... outros detalhes do usuário
  "Address": [
    {
      "id": "address_id_1",
      "street": "123 Main Street",
      "city": "Cityville",
      // ... outros atributos do Address
    },
    // ... mais endereços, se houver
  ],
  // ... outros relacionamentos
  "monthly_invoicing": 123.45
};
    } catch (error) {
      throw new IdezErrors().message(error);
    }
  }

 
}
*/
}

import { compareSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type IdezAuthServiceRequest = {
  access_token: string | null;
  account: any;
  document: string;
  password: string;
  withoutPass?: boolean;
};

export class IdezAuthService {
  public async execute(data: IdezAuthServiceRequest) {
    const user = await prisma.user.findUnique({
      where: {
        document: data?.document,
      },
    });

    if (!user) throw new Error("Usuário ou senha incorretos");

    const passwordIsValid =
      data.withoutPass || compareSync(data.password, user.password as string);

    if (!user || !passwordIsValid) {
      //   if (user) {
      //     if (account) {
      //       // Recupera o contador atual antes de incrementar
      //       const currentCounter = account.counter;

      //       // Incrementa o contador de erros apenas para contas gráficas
      //       await prisma.account.update({
      //         where: {
      //           id: account.id,
      //         },
      //         data: {
      //           counter: account.counter + 1,
      //         },
      //       });

      //       // Exibe o valor atual do contador no console
      //       console.log(
      //         `Erro de autenticação! Contador atual: ${currentCounter}`,
      //       );

      //       // Se o contador atingir 3, atualiza o campo 'blocked' para true
      //       if (currentCounter + 1 >= 3) {
      //         await prisma.account.update({
      //           where: {
      //             id: account.id,
      //           },
      //           data: {
      //             blocked: true,
      //           },
      //         });
      //       }
      //       // if (account.blocked) {
      //       //   // Se a conta estiver bloqueada, notifica o usuário e impede a continuação do processo
      //       //   throw new Error("Usuário impedido de fazer login. Conta bloqueada.");
      //       // }

      //       if (account.status == "under_review") {
      //         // Se a conta estiver bloqueada, notifica o usuário e impede a continuação do processo
      //         throw new AppError({ message: "Conta em análise", status: 401 });
      //       }
      //     }
      //   }
      //   throw new AppError({ message: "Usuário ou senha incorretos" });
      // } else {
      //   // Limpa o contador de erros se a autenticação for bem-sucedida
      //   if (account) {
      //     await prisma.account.update({
      //       where: {
      //         id: account.id,
      //       },
      //       data: {
      //         counter: 0,
      //       },
      //     });

      //     // Se o contador estava em 3 e agora foi zerado, atualiza o campo 'blocked' para false
      //     if (account.counter >= 3) {
      //       await prisma.account.update({
      //         where: {
      //           id: account.id,
      //         },
      //         data: {
      //           blocked: false,
      //         },
      //       });
      //     }
      //   }
      // }

      return data;
    }
  }
}
