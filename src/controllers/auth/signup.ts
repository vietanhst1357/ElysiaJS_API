import { Elysia } from "elysia";
import { prisma } from "../../prisma/prisma";
import cookie from "@elysiajs/cookie";
import { basicAuthModel, jwtAccessSetup, jwtRefreshSetup } from "./jwtSetup";
import { randomUUID } from "crypto";

export const signup = new Elysia()
  .use(basicAuthModel)
  .use(cookie())
  .use(jwtAccessSetup)
  .use(jwtRefreshSetup)
  // body {email, password}
  .post("/signup", async ({ body, set, jwtAccess, jwtRefresh, setCookie }) => {
      const isExistedUser = await prisma.user.findUnique({
        where: {
          email: body.email,
        },
      });
      if (isExistedUser) {
        set.status = 400;
        throw new Error("Email already in use.")
      }
      const savedPassword = await Bun.password.hash(body.password);
      const refreshId = randomUUID();
      const refreshToken = await jwtRefresh.sign({
        id: refreshId,
      });
      const hashedToken = new Bun.CryptoHasher("sha512")
        .update(refreshToken)
        .digest("hex");

      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: savedPassword,
          refreshTokens: {
            create: {
              hashedToken,
              id: refreshId,
            },
          },
        },
      });
      if (!user) {
        throw new Error("Failed to register user.");
      }
      const accessToken = await jwtAccess.sign({
        id: String(user.id),
      });
      setCookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 86400,
      });
      return {
        accessToken,
      };
    },
    {
      body: "basicAuthModel",
    }
  );