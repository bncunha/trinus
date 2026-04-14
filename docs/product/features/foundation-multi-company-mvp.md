# Feature: Fundacao Multiempresa MVP

## Status

Concluida.

A Fase 0 esta pronta para liberar o refinamento da Fase 1. O fluxo de autenticacao, empresa, primeiro administrador, sessao, papeis, gestao minima de usuarios, persistencia e testes criticos foi fechado.

## Objetivo

Garantir que empresa, usuarios, papeis, sessao e dados operacionais nascam com isolamento correto por empresa antes da criacao dos cadastros base.

## Escopo de Fechamento

- Criar empresa e primeiro usuario administrador.
- Persistir empresas e usuarios no banco.
- Login, refresh, sessao e logout com cookies HTTP-only.
- Usuario vinculado a uma unica empresa.
- Papeis `ADMIN`, `MANAGER` e `OPERATOR`.
- Rotas protegidas por autenticacao.
- Rotas administrativas protegidas por papel.
- Consultas e comandos sempre filtrados pelo `companyId` da sessao.
- Validacoes de unicidade preparadas para considerar a empresa atual.
- Gestao minima de usuarios da propria empresa pelo `ADMIN`.
- UX publica de login e criacao de conta alinhada com a especificacao.
- Testes automatizados cobrindo os fluxos criticos.

## Decisao de Produto

A Fase 1 so deve iniciar quando a Fase 0 estiver validavel de ponta a ponta. Cadastros base dependem diretamente de `companyId`, papel do usuario e persistencia, entao iniciar cadastros antes dessa fundacao aumenta o risco de retrabalho e vazamento entre empresas.

## Entregas Realizadas

### Backend

- Integrar `Company` e `User` ao Prisma.
- Criar migrations da Fase 0.
- Substituir o repositorio em memoria de contas por repositorio persistente.
- Manter senha armazenada apenas como hash.
- Garantir que `register` crie empresa e primeiro usuario `ADMIN` em uma transacao.
- Garantir login por credenciais persistidas.
- Garantir refresh usando usuario persistido e `companyId` do token.
- Validar `role` em runtime, aceitando apenas `ADMIN`, `MANAGER` e `OPERATOR`.
- Garantir que `POST /users` crie usuarios apenas na empresa do `ADMIN` autenticado.
- Garantir que `GET /users` liste apenas usuarios da empresa autenticada.
- Definir a regra final para e-mail:
  - e-mail e identidade global de login nesta fase;
  - e-mail nao pode repetir entre empresas;
  - essa e uma excecao explicita a regra geral de unicidade por empresa.

### Frontend e UX

- Manter `/login` e `/criar-conta` como telas publicas sem shell autenticado.
- Alinhar a linha publica com `Pedidos, prazos e producao sob controle.`.
- Exibir erro de sessao indisponivel quando a verificacao falhar por rede ou `5xx`.
- Apresentar papel do usuario em portugues no shell, sem enum cru.
- Criar fluxo minimo de gestao de usuarios para `ADMIN`, ou registrar explicitamente que a criacao de usuarios sera feita apenas via API nesta fase.
- Garantir redirecionamento por papel:
  - `ADMIN` e `MANAGER` para `/dashboard`;
  - `OPERATOR` para `/minha-execucao`.

### QA e Revisao

- Backend coberto:
  - registro cria empresa e primeiro admin persistidos;
  - login usa dados persistidos;
  - refresh rejeita token invalido ou tipo incorreto;
  - access token nao aceita refresh token;
  - rota protegida sem cookie retorna `401`;
  - `POST /users` exige `ADMIN`;
  - `MANAGER` e `OPERATOR` nao criam usuarios;
  - usuario de uma empresa nao lista usuarios de outra empresa;
  - payload com papel invalido e rejeitado.
- Frontend coberto:
  - login com sucesso;
  - login com credenciais invalidas;
  - criacao de conta com sucesso;
  - criacao de conta com erro;
  - guard de rota protegida para usuario anonimo;
  - refresh em `401` de requisicao protegida;
  - falha de refresh redireciona para `/login`;
  - shell exibe usuario, empresa e papel formatado.
- E2E coberto:
  - registro de nova empresa;
  - login;
  - acesso a rota protegida;
  - refresh de sessao;
  - logout;
  - tentativa de acessar dados de outra empresa sem sucesso.
- `pnpm --filter @trinus/api exec jest --runInBand` passa.
- `pnpm --filter @trinus/web exec jest --runInBand` passa.
- `pnpm test:e2e` passa com cenarios autenticados.
- `pnpm build` passa.
- `pnpm lint` ainda depende da criacao de `eslint.config.*` para ESLint 9 no workspace.

### Documentacao

- Atualizar `docs/api/authentication.md` se a persistencia ou regra de e-mail mudar.
- Atualizar `docs/api/authorization.md` com o escopo real de cada papel na Fase 0.
- Atualizar `docs/development/screens/auth.md` se houver ajuste de UX.
- Atualizar o backlog com o status concluido da Fase 0.

## Criterios de Aceite

- Ao criar conta, a API persiste uma empresa e um usuario `ADMIN` vinculado a ela.
- Login funciona depois de reiniciar o backend, usando dados persistidos.
- Cookies de access token e refresh token sao HTTP-only.
- Refresh token nao e aceito como access token.
- Usuario autenticado acessa apenas dados da propria empresa.
- `ADMIN` consegue listar e criar usuarios somente na propria empresa.
- `MANAGER` e `OPERATOR` nao conseguem acessar endpoints administrativos de usuarios.
- Papel invalido e rejeitado no backend.
- As telas publicas de login e criacao de conta nao exibem shell autenticado.
- O shell autenticado exibe usuario, empresa e papel em linguagem de usuario.
- Testes automatizados de API e Web passam.
- Testes e2e autenticados passam.

## Fora do Escopo

- Cadastros base da Fase 1.
- Permissoes completas por tela da Fase 1.
- Execucao detalhada de operador.
- Recuperacao de senha.
- Convite por e-mail.
- Auditoria completa de login.

## Itens Fechados

- Repositorio persistente de contas usando Prisma.
- Migration inicial de `Company` e `User`.
- Validacao runtime de `role`.
- Gestao minima de usuarios no frontend para `ADMIN`.
- Testes cobrindo controllers, guards, roles e telas/servicos criticos de autenticacao.
- E2E autenticado cobrindo criacao de conta, rota protegida e logout.
