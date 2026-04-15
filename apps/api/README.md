# API

Backend NestJS com TypeScript do Trinus.

O projeto é um SaaS multiempresa para controle operacional de confecções, com foco em pedidos, produção, prazos, fila, risco de atraso e pós-venda.

## Responsabilidades

- Endpoints HTTP.
- Regras de aplicação usando DDD.
- Integração com banco de dados MySQL via Prisma.
- Autenticação com JWT em cookies HTTP-only.
- Autorização por papel: `ADMIN`, `MANAGER` e `OPERATOR`.
- Isolamento de dados por empresa.
- Geração de OpenAPI para consumo do frontend.
- Testes unitários com Jest.

## Como Rodar Local

Na raiz do monorepo:

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
docker compose up -d mysql
pnpm dev:api
```

Para rodar tudo em containers:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
docker compose up --build
```

## Variáveis de Ambiente

Copie `.env.example` para `.env`.

```txt
NODE_ENV=development
PORT=3000
DATABASE_URL="mysql://trinus:trinus@localhost:3306/trinus"
JWT_SECRET="change-me"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="1h"
AUTH_COOKIE_NAME="trinus_auth"
AUTH_REFRESH_COOKIE_NAME="trinus_refresh"
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_SAME_SITE="lax"
CORS_ORIGIN="http://localhost:4500"
```

Ao rodar a API dentro do `docker compose`, o host do banco é sobrescrito para `mysql`, que é o nome do serviço na rede Docker.

## Segurança

O backend deve retornar apenas os dados necessários para cada tela.

Operadores não devem receber informações confidenciais, como preço final da venda e criticidade do pedido.
