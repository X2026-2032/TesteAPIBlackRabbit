import { AppError } from "@/use-cases/errors/app-error";
import { makeGetUserProfileUseCase } from "@/use-cases/factories/make-get-user-profile-use.case";
import { FastifyReply, FastifyRequest } from "fastify";

export async function profile(request: FastifyRequest, reply: FastifyReply) {
  try {
    const getUserProfile = makeGetUserProfileUseCase();

    const { user, account } = await getUserProfile.execute({
      userId: request.user.sub,
    });

    const token = await reply.jwtSign(
      {
        role: user.role,
        //   type: user.type,
      },
      {
        sign: {
          sub: user.id,
          expiresIn: "30min",
        },
      },
    );
    const data = {
      user: {
        ...user,
        access_token: token,
      },
    };
    return reply.status(200).send(data);
  } catch (error: any) {
    throw new AppError(error);
  }
}
