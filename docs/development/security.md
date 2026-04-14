# Segurança

## Regra Geral

Backend e frontend devem se preocupar com a segurança da aplicação.

Quando qualquer agente identificar uma decisão, implementação ou estratégia que possa prejudicar a segurança, isso deve ser informado antes de seguir.

## Diretrizes Iniciais

- A autenticação deve usar JWT em cookies HTTP-only.
- O frontend não deve armazenar token em `localStorage` ou `sessionStorage`.
- O access token deve expirar em 1 hora por padrão.
- O refresh token deve expirar em 1 hora por padrão.
- O refresh token deve ficar em cookie HTTP-only separado.
- O refresh token deve ser usado apenas para renovar sessão em `/auth/refresh`.
- Cookies de autenticação devem usar `Secure` em produção.
- O logout deve remover os cookies de access token e refresh token.
- O backend deve retornar apenas os dados necessários para cada tela.
- Dados sensíveis não devem ser enviados ao frontend sem necessidade.
- Operadores podem receber apenas número do pedido, cliente, situação atual, data de início, data de entrega e produtos.
- Operadores não devem receber informações confidenciais, como preço final da venda e criticidade do pedido.
- Cada usuário pertence a uma única empresa.
- Toda consulta de dados deve respeitar o isolamento por empresa.
- A autorização deve considerar o papel do usuário: `ADMIN`, `MANAGER` ou `OPERATOR`.
- O frontend pode ocultar ações indisponíveis, mas a validação real deve acontecer no backend.
- Mudanças de autenticação, autorização ou isolamento de dados devem ser revisadas com cuidado.
