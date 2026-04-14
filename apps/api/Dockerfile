FROM node:20-alpine

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages packages

RUN pnpm install --filter @trinus/api --frozen-lockfile=false

COPY . .

EXPOSE 3000

CMD ["pnpm", "--filter", "@trinus/api", "dev"]
