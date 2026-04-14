# Trinus

SaaS de controle operacional para confecções, com inteligência de prazos e produção.

O MVP foca em pedidos, produção, fila, risco de atraso, dashboard operacional, usuários, autenticação e pós-venda.

## Stack

- Monorepo: pnpm workspaces.
- Frontend: Angular.
- Backend: NestJS.
- Banco de dados: MySQL.
- ORM: Prisma.
- Autenticação: JWT em cookie HTTP-only.
- Testes unitários: Jest.
- E2E: Playwright.
- Ambiente local: Docker Compose.

## Como Rodar

Crie os arquivos de ambiente:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Instale as dependências:

```bash
pnpm install
```

Suba o banco:

```bash
docker compose up -d mysql
```

Rode os projetos:

```bash
pnpm dev
```

Ou rode tudo em containers:

```bash
docker compose up --build
```

## Apps

- `apps/api`: API NestJS.
- `apps/web`: frontend Angular.

## Documentação

- `docs/product`: visão e regras de produto.
- `docs/architecture`: decisões e modelo do domínio.
- `docs/development`: telas, UX, segurança e convenções.
- `docs/api`: autenticação, autorização e contratos da API.
- `agents`: papéis, regras e workflows dos agentes.

