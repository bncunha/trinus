# ADR 0005: Autenticação com JWT em Cookie HTTP-Only

## Contexto

O sistema será um SaaS web com frontend Angular e backend NestJS.

Usuários precisam autenticar para acessar dados da própria empresa. O sistema também terá criação de nova conta, que cria uma empresa e o primeiro usuário administrador.

## Decisão

A autenticação usará access token e refresh token em cookies HTTP-only.

O frontend não deve armazenar token em `localStorage` ou `sessionStorage`.

## Regras

- O backend deve emitir access token e refresh token após login ou cadastro bem-sucedido.
- O access token deve expirar em 1 hora por padrão.
- O refresh token deve expirar em 1 hora por padrão.
- O access token deve ser enviado no cookie HTTP-only `trinus_auth`.
- O refresh token deve ser enviado no cookie HTTP-only `trinus_refresh`.
- O refresh token deve ser usado apenas para renovar sessão em `/auth/refresh`.
- O refresh token não deve ser aceito como access token.
- Os cookies devem usar `Secure` em ambiente de produção.
- Os cookies devem usar `SameSite` adequado ao ambiente.
- O backend deve validar o access token em rotas protegidas.
- O backend deve aplicar autorização por papel.
- O backend deve garantir isolamento por empresa em todas as consultas.
- O logout deve remover os cookies de access token e refresh token.

## Consequências

- O frontend não manipula diretamente os tokens.
- Requisições autenticadas devem enviar cookies.
- Ao receber `401` em uma requisição protegida, o frontend deve tentar `/auth/refresh` antes de redirecionar para login.
- Se o refresh falhar, o frontend deve limpar a sessão local e redirecionar para `/login`.
- O backend concentra validação de autenticação, autorização e empresa.
- A estratégia reduz exposição dos tokens a scripts no navegador.
- Configuração de CORS e cookies precisa ser feita com cuidado.
