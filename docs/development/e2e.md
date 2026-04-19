# Testes E2E

## Estrategia

Os testes E2E do projeto rodam contra backend real e banco real descartavel. A suite nao usa mocks de `page.route` para os fluxos criticos da Fase 0.

O comando principal e:

```bash
pnpm test:e2e
```

O alias explicito tambem existe:

```bash
pnpm test:e2e:real
```

## Ambiente

Ao iniciar a suite, o Playwright executa:

- MySQL E2E em container Docker separado.
- API NestJS em `http://localhost:3001`.
- Frontend Angular em `http://localhost:4201`.
- Migrations Prisma no banco E2E antes dos testes.

O banco E2E usa:

```text
mysql://trinus_e2e:trinus_e2e@127.0.0.1:3307/trinus_e2e
```

O container `trinus-mysql-e2e` nao usa volume persistente. Isso e intencional: dados criados durante os testes, como empresas e usuarios, devem ser descartados ao final da execucao.

## Limpeza

Ao final da suite, o Playwright executa `docker compose -f docker-compose.e2e.yml down -v --remove-orphans`.

Se uma execucao for interrompida manualmente, a limpeza pode ser feita com:

```bash
docker compose -f docker-compose.e2e.yml down -v --remove-orphans
```

## Cobertura Atual da Fase 0

A suite em `e2e/phase0-foundation.spec.ts` cobre:

- Redirecionamento de visitante anonimo para `/login`.
- Criacao de empresa e primeiro usuario administrador.
- Cookies de access token e refresh token como HTTP-only.
- Refresh de sessao usando refresh token real.
- Logout e login real.
- Administrador criando usuarios `MANAGER` e `OPERATOR`.
- Bloqueio de endpoint administrativo `/users` para `MANAGER`.
- Redirecionamento de `OPERATOR` para `/minha-execucao`.
- Isolamento de usuarios entre empresas.

## Observacoes

- A API de teste usa porta `3001` para evitar conflito com a API local em `3000`.
- O frontend de teste usa porta `4201` para evitar conflito com o frontend local em `4200`.
- O frontend aceita a URL da API em runtime durante os testes por `window.__TRINUS_API_URL__`.
