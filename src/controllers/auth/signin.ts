import { Elysia } from "elysia";
import { basicAuthModel, jwtAccessSetup, jwtRefreshSetup } from "./jwtSetup";
import { prisma } from "../../prisma/prisma";
import { randomUUID } from "crypto";

export const signin = new Elysia()
  .use(basicAuthModel)
  .use(jwtAccessSetup)
  .use(jwtRefreshSetup)
  // body {email, password}
  .post("/signin", async ({ body, set, jwtAccess, jwtRefresh }) => {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: body.email,
        },
      });
      if (!existingUser) {
        throw new Error("Wrong email or password.")
      }

      const validPassword = await Bun.password.verify(
        body.password,
        existingUser.password
      );
      if (!validPassword) {
        throw new Error("Wrong email or password.")
      }

      const refreshId = randomUUID();
      const refreshToken = await jwtRefresh.sign({
        id: refreshId,
      });
      const hashedToken = new Bun.CryptoHasher("sha512")
        .update(refreshToken)
        .digest("hex");
      
      await prisma.refreshToken.create({
        data: {
          hashedToken,
          id: refreshId,
          userId: existingUser.id,
        },
      });

      const accessToken = await jwtAccess.sign({
        id: String(existingUser.id),
      });
      return {
        accessToken,
      };
    },
    {
      body: "basicAuthModel",
    }
  );