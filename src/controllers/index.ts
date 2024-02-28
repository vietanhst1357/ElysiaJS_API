import { Elysia } from "elysia";
import { auth } from "./auth";

export const route = new Elysia({ prefix: "/api"})
  .use(auth)