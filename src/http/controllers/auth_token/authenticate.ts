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
          include: {},
        },
        User: {
          include: {},
        },
      },
    });

    const user = user_token?.User || (user_token?.GraphicAccount as any);

    const account = user_token?.User
      ? user_token?.User
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

    // const userAccount =
    //   user.role === "MEMBER" ||
    //   user.role === "ADMIN" ||
    //   user.role === "OPERATOR" ||
    //   user.role === "ADMIN_BAG" ||
    //   user.role === "MASTER"
    //     ? await getMemberAdminAccount(user.id, user.refId as string)
    //     : null;

    // const isGraphicAccountMember = await prisma.graphicAccount.findFirst({
    //   where: {
    //     id_master_user: user.id,
    //   },
    // });

    const data = {
      user: {
        ...user,
        access_token: undefined,
        //idMasterUser: isGraphicAccountMember ? true : false,
      },
      token,
    };

    return reply.status(200).send(data);
  } catch (error) {
    console.log(error);

    throw new AppError(error as unknown as IRequest);
  }
}
