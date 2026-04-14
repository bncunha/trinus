# ADR 0002: Stack Técnica Inicial

## Contexto

O projeto será um monorepo com frontend, backend, pacotes compartilhados, documentação e regras operacionais para agentes.

O produto será um SaaS multiempresa para controle operacional de confecções.

## Decisão

A stack inicial será:

- Monorepo: pnpm workspaces.
- Frontend: Angular.
- Backend: NestJS.
- Banco de dados: MySQL.
- ORM: Prisma.
- Contratos de API: OpenAPI gerado pelo backend.
- Autenticação: JWT em cookie HTTP-only.
- Testes backend: Jest.
- Testes frontend: Jest.
- Testes end-to-end: Playwright.
- Ambiente local: Docker Compose.
- Execução dos projetos: containers Docker.

## Consequências

- O backend será a fonte principal da especificação OpenAPI.
- O frontend deve consumir apenas dados necessários para cada tela.
- O ambiente local deve ser reproduzível por Docker Compose.
- Testes unitários devem fazer parte do fluxo normal de desenvolvimento.
- Testes end-to-end devem validar fluxos críticos do produto.
