import { Elysia } from "elysia";
import { refresh } from "./refresh";
import { signin } from "./signin";
import { signup } from "./signup";

export const auth = new Elysia({ prefix: "/auth" })
  .use(refresh)
  .use(signin)
  .use(signup)