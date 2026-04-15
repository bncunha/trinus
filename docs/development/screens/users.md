# Tela: Usuários

## Objetivo

Permitir que o Administrador gerencie os usuários que acessam sua empresa.

## Usuários

- Administrador.

## Estrutura

A tela `/usuarios` deve manter a lista como experiência principal.

Como o cadastro de usuário é simples, o formulário de criação e edição deve abrir em drawer lateral no desktop. No mobile, o drawer deve se comportar como tela cheia ou sheet.

Não devem ser criadas rotas separadas como `/usuarios/novo` ou `/usuarios/:id/editar` para este fluxo.

## Conteúdo da Lista

- Nome.
- E-mail.
- Papel.
- Situação do acesso.

## Filtros

A lista de usuários usa filtros locais no front-end, porque a lista atual é pequena e carregada inteira por empresa.

Filtros disponíveis:

- Busca por nome ou e-mail.
- Papel: todos, Administrador, Gestor ou Operador.
- Situação: todas, ativos ou inativos.

Comportamento esperado:

- Os filtros devem ficar acima da lista, abaixo do cabeçalho da tela.
- No desktop, os filtros podem aparecer em uma barra compacta.
- No mobile, os campos devem empilhar para preservar legibilidade.
- A lista deve atualizar de forma reativa ao alterar os filtros.
- O botão `Limpar filtros` só deve aparecer quando houver filtro ativo.
- A tela deve exibir o total de usuários cadastrados ou encontrados.
- Quando não houver cadastro, usar o estado vazio principal.
- Quando houver cadastro, mas nenhum resultado para os filtros, usar estado vazio específico de busca.

## Ações

- Novo usuário.
- Editar usuário como ação discreta por item no desktop.
- Mais opções por item.
- Ativar acesso pelo menu de ações.
- Desativar acesso pelo menu de ações.
- Excluir usuário pelo menu de ações, quando a regra permitir.

## Ações na Lista

- No desktop, cada item deve exibir `edit` como ação rápida para editar.
- Cada item deve exibir `more_vert` para abrir o menu `Mais opções`.
- No mobile, a ação rápida de editar pode ser ocultada, mantendo apenas o menu `Mais opções`.
- O menu deve exibir texto completo para cada ação.
- `Excluir usuário` deve aparecer como ação destrutiva e exigir confirmação.
- Ações no topo após seleção não são o padrão desta tela, porque as ações atuais são individuais.

## Criar Usuário

Campos:

- Nome.
- E-mail.
- Papel.
- Usuário ativo.
- Senha inicial, obrigatória quando o usuário estiver ativo.

Papéis:

- Administrador.
- Gestor.
- Operador.

## Editar Usuário

Campos:

- Nome.
- Papel.
- Usuário ativo.
- Nova senha opcional.

No fluxo atual, o e-mail fica bloqueado na edição por ser a identidade de login.

## Comportamento

- Usuários criados pertencem à mesma empresa do Administrador autenticado.
- O Administrador pode criar usuários ativos ou inativos.
- Usuário ativo precisa ter senha.
- Na edição, a senha só deve ser alterada quando o campo `Nova senha` for preenchido.
- O sistema não deve permitir excluir o próprio usuário autenticado.
- O sistema não deve permitir desativar o próprio usuário autenticado.
- O sistema não deve permitir excluir, desativar ou rebaixar o único Administrador ativo da empresa.
- O sistema não deve permitir deixar a empresa sem pelo menos um Administrador ativo.
- A exclusão atual é física enquanto não houver histórico operacional vinculado ao usuário. Quando houver vínculo de histórico, a ação principal deve ser desativar acesso.
- Ativar, desativar e excluir devem pedir confirmação.

## Estados

- Carregando: `Carregando usuários...`
- Vazio: `Nenhum usuário cadastrado ainda.`
- Erro ao carregar: `Não foi possível carregar os usuários. Tente novamente.`
- Sucesso ao criar: `Usuário criado com sucesso.`
- Sucesso ao editar: `Alterações salvas com sucesso.`
- Sucesso ao ativar: `Acesso ativado com sucesso.`
- Sucesso ao desativar: `Acesso desativado com sucesso.`
- Sucesso ao excluir: `Usuário excluído com sucesso.`

## Instrução Recomendada

```txt
O papel define quais informações o usuário pode ver e alterar.
```
