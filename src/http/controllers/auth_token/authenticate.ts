import { AppError, IRequest } from "@/use-cases/errors/app-error";
import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@/lib/prisma";

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const token_number = request.headers.authorization;

    const user_token = await prisma.authToken.findFirst({
      where: {
        token: token_number,
      },
      include: {
        GraphicAccount: {
          include: {
            account: true,
          },
        },
        User: {
          include: {
            Account: true,
          },
        },
      },
    });

    const user = user_token?.User || (user_token?.GraphicAccount as any);

    const account = user_token?.User
      ? user_token?.User?.Account
      : user_token?.GraphicAccount;

    if (!user) {
      throw new Error("Usuário não encontrado");
    }
    const token = await reply.jwtSign(
      {
        role: user.role,
        type: user.type,
      },
      {
        sign: {
          sub: user.id,
          expiresIn: "30d",
        },
      },
    );

    const userAccount =
      user.role === "MEMBER" ||
      user.role === "ADMIN" ||
      user.role === "OPERATOR" ||
      user.role === "ADMIN_BAG" ||
      user.role === "MASTER"
        ? await getMemberAdminAccount(user.id, user.refId as string)
        : null;

    const isGraphicAccountMember = await prisma.graphicAccount.findFirst({
      where: {
        id_master_user: user.id,
      },
    });

    const address = await prisma.address.findFirst({
      where: {
        graphicId: user.id,
      },
    });

    const data = {
      user: {
        ...user,
        address,
        access_token: undefined,
        idMasterUser: isGraphicAccountMember ? true : false,
      },
      account: userAccount || account,
      token,
    };

    return reply.status(200).send(data);
  } catch (error) {
    console.log(error);

    throw new AppError(error as unknown as IRequest);
  }
}

export async function getMemberAdminAccount(userId: string, refId: string) {
  try {
    const account = await prisma.account.findFirst({
      where: {
        user_id: userId,
        refId,
      },
    });

    if (!account) {
      throw new AppError({ message: "Account not found for the user" });
    }

    // Retorna a conta
    return account;
  } catch (err: any) {
    throw new Error(err);
  }
}
