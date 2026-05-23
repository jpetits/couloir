import "dotenv/config";
import "reflect-metadata";

import { clerkMiddleware } from "@clerk/express";
import { NestFactory } from "@nestjs/core";
import { WsAdapter } from "@nestjs/platform-ws";
import helmet from "helmet";
import { AppModule } from "./src/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });
  app.use(helmet());
  app.setGlobalPrefix("api");
  app.use(clerkMiddleware());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
