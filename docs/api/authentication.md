# Autenticação

## Estratégia

A API usa JWT em cookies HTTP-only.

O frontend não deve armazenar token em `localStorage` ou `sessionStorage`.

## Tokens

- Access token: cookie `trinus_auth`, duração padrão de 1 hora.
- Refresh token: cookie `trinus_refresh`, duração padrão de 1 hora.
- Os dois cookies são HTTP-only.
- O access token é usado para acessar rotas protegidas.
- O refresh token é usado apenas para renovar a sessão em `/auth/refresh`.
- Refresh token não pode ser aceito como access token.
- Logout deve remover os dois cookies.

Variáveis de ambiente:

- `JWT_EXPIRES_IN`: duração do access token. Padrão: `1h`.
- `JWT_REFRESH_EXPIRES_IN`: duração do refresh token. Padrão: `1h`.
- `AUTH_COOKIE_NAME`: nome do cookie de access token. Padrão: `trinus_auth`.
- `AUTH_REFRESH_COOKIE_NAME`: nome do cookie de refresh token. Padrão: `trinus_refresh`.

## Criar Nova Conta

Cria uma nova empresa e o primeiro usuário administrador.

Resultado esperado:

- Empresa criada.
- Usuário criado com papel `ADMIN`.
- Usuário vinculado à empresa criada.
- Sessão autenticada iniciada com access token e refresh token.

## Login

Autentica um usuário existente.

Resultado esperado:

- Access token emitido pelo backend.
- Refresh token emitido pelo backend.
- Cookies HTTP-only definidos na resposta.
- Usuário passa a acessar rotas protegidas conforme seu papel.

Decisao da Fase 0:

- O e-mail do usuario e a identidade global de login.
- Por isso, e-mail de usuario nao pode repetir entre empresas.
- Essa e uma excecao explicita a regra geral de unicidade por empresa, porque a tela de login pede apenas e-mail e senha.

## Refresh

Renova a sessão quando o access token expira e o refresh token ainda é válido.

Resultado esperado:

- Backend valida o refresh token.
- Backend emite novo access token.
- Backend emite novo refresh token.
- Frontend repete a requisição protegida que falhou por expiração.

Se o refresh token também estiver expirado ou inválido:

- Backend retorna `401`.
- Frontend limpa a sessão local.
- Frontend redireciona o usuário para `/login`.

## Logout

Encerra a sessão do usuário.

Resultado esperado:

- Cookie de access token removido.
- Cookie de refresh token removido.
- Usuário deixa de acessar rotas protegidas.

## Regras de Segurança

- Rotas protegidas devem exigir autenticação.
- Rotas administrativas devem exigir papel adequado.
- Toda consulta deve respeitar o `companyId` do usuário autenticado.
- Operadores não devem receber dados confidenciais.
- Mensagens de erro de login não devem revelar se o e-mail existe.
