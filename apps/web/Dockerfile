FROM node:20-alpine

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages packages

RUN pnpm install --filter @trinus/web --frozen-lockfile=false

COPY . .

EXPOSE 4200

CMD ["pnpm", "--filter", "@trinus/web", "dev", "--host", "0.0.0.0"]
