FROM node:20-alpine

RUN apk add --no-cache openssl
RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma apps/api/prisma
COPY packages packages

RUN pnpm install --filter @trinus/api --filter @trinus/contracts --frozen-lockfile=false
RUN pnpm --filter @trinus/contracts build
RUN pnpm --filter @trinus/api exec prisma generate

COPY . .

EXPOSE 3000

CMD ["pnpm", "--filter", "@trinus/api", "dev"]
