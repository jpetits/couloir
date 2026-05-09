FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install  --config.unsafe-perm=true

COPY . .

EXPOSE 8002

CMD ["pnpm", "start"]
