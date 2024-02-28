import { Elysia } from "elysia";
import { route as API } from "./controllers";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .use(API)
  .listen(3000)


console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
