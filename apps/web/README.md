# Web

Frontend Angular do Trinus.

O projeto é um SaaS multiempresa para controle operacional de confecções, com foco em pedidos, produção, prazos, fila, risco de atraso e pós-venda.

## Responsabilidades

- Telas, rotas e componentes específicos da aplicação web.
- Integração com a API.
- Estado e comportamento de interface.
- Implementação mobile first.
- CSS no padrão BEM, sem frameworks CSS.
- Componentes organizados com Atomic Design.
- Testes unitários com Jest.

## Como Rodar Local

Na raiz do monorepo:

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
pnpm dev:web
```

Para rodar tudo em containers:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
docker compose up --build
```

Depois acesse:

```txt
http://localhost:4500
```

## Variáveis de Ambiente

Copie `.env.example` para `.env`.

```txt
NG_APP_API_URL=http://localhost:3000
```

## Regras de Interface

- As telas devem ser simples, coerentes e autoexplicativas.
- O sistema deve ser desenhado primeiro para mobile.
- Campos e ações ambíguas devem ter instruções curtas.
- O frontend deve consumir apenas os dados necessários para cada tela.
