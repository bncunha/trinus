# Telas: Autenticação

## Estado Público da Fase 0

As rotas `/login` e `/criar-conta` devem abrir como telas públicas.

Essas telas devem exibir marca, linha de valor, título, texto curto, campos e ações principais. Elas não devem exibir sidebar, dashboard ou qualquer conteúdo autenticado.

As telas públicas devem ter identidade visual própria. Elas não devem parecer um formulário reaproveitado do shell interno.

A frase `Operação simples` não deve ser usada como subtítulo da marca. A mensagem pública deve ser específica do produto:

```txt
Pedidos, prazos e produção sob controle.
```

Quando não houver sessão, a ausência de autenticação é um estado normal. O frontend não deve mostrar erro visual por causa de `401` em verificação de sessão.

Se a aplicação precisar verificar sessão em rotas protegidas e receber `401`, deve limpar dados locais de sessão e redirecionar para `/login`.

Se a verificação de sessão falhar por rede, timeout ou erro `5xx`, a mensagem recomendada é:

```txt
Não foi possível verificar sua sessão. Tente novamente.
```

## Login

## Objetivo

Permitir que usuários existentes acessem o sistema.

## Usuários

- Administrador.
- Gestor.
- Operador com acesso cadastrado.

## Conteúdo

- E-mail.
- Senha.
- Botão Entrar.
- Botão Criar nova conta.
- Linha de valor: `Pedidos, prazos e produção sob controle.`

## Comportamento

- O botão Entrar deve autenticar o usuário.
- Durante o envio, o botão deve mostrar `Entrando...` e ficar desabilitado.
- Após login, o sistema deve direcionar o usuário para a tela inicial do seu papel.
- Administrador e Gestor devem ir para o Dashboard.
- Operador deve ir para Minha Execução.
- A mensagem de erro não deve revelar se o e-mail existe.
- Para credenciais inválidas, usar:

```txt
Credenciais inválidas.
```

- O botão Criar nova conta deve levar para o cadastro de nova empresa.

## Microcopy Recomendada

```txt
Entrar no Trinus
Entre para acompanhar pedidos, prazos e decisões da produção.
```

## Estados

- Carregando ao enviar login.
- Erro de credenciais inválidas.
- Erro inesperado.

## Criar Nova Conta

## Objetivo

Criar uma nova empresa e o primeiro usuário administrador.

## Conteúdo

- Nome da empresa.
- Nome do administrador.
- E-mail.
- Senha.
- Botão Criar conta.
- Link para voltar ao Login.

## Comportamento

- A tela deve explicar em uma frase curta que a nova conta cria uma nova empresa e o primeiro administrador.
- Ao criar a conta, o sistema cria a empresa.
- O sistema cria o primeiro usuário vinculado à empresa.
- O primeiro usuário deve ter papel `ADMIN`.
- Durante o envio, o botão deve mostrar `Criando...` e ficar desabilitado.
- Após cadastro, o usuário deve ser autenticado e direcionado para o Dashboard.
- Em erro, usar:

```txt
Não foi possível criar a conta.
```

## Microcopy Recomendada

```txt
Criar conta
Abra uma nova empresa no Trinus e configure o primeiro acesso.
```

## Instruções de UX

- Informar de forma curta que a nova conta cria uma nova empresa.
- Evitar termos técnicos como tenant ou multiempresa.
