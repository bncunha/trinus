# Autorizacao

## Papeis

O MVP tera tres papeis:

- `ADMIN`
- `MANAGER`
- `OPERATOR`

## ADMIN

Responsavel por gerenciar a empresa, usuarios e configuracoes.

Permissoes iniciais:

- Gerenciar dados da propria empresa.
- Cadastrar usuarios da propria empresa.
- Alterar papel de usuarios da propria empresa.
- Ativar ou desativar acesso de usuarios da propria empresa.
- Gerenciar tamanhos de vestuario.
- Gerenciar unidades de medida.
- Gerenciar variaveis.
- Gerenciar clientes.
- Gerenciar produtos.
- Gerenciar setores.
- Gerenciar etapas.
- Gerenciar templates de producao.
- Gerenciar calendario de trabalho simples.
- Acessar visao de Gestor.

## MANAGER

Responsavel por gerenciar pedidos, fila e producao.

Permissoes iniciais:

- Criar pedidos.
- Visualizar pedidos da propria empresa.
- Alterar pedidos.
- Cadastrar cliente rapidamente durante o pedido.
- Cadastrar produto rapidamente durante o pedido.
- Ajustar etapas do pedido.
- Alterar criticidade.
- Marcar ou remover impedimento de etapa.
- Pausar, cancelar e finalizar pedidos.
- Visualizar dashboard operacional.
- Reordenar fila de producao.
- Visualizar riscos e impactos da fila.

## OPERATOR

Responsavel por visualizar apenas a propria execucao e dados permitidos.

No primeiro MVP, a execucao detalhada do Operador fica fora do fluxo principal.

Quando entrar no escopo, restricoes iniciais:

- Nao pode visualizar preco final da venda.
- Nao pode visualizar criticidade.
- Nao pode visualizar informacoes comerciais sensiveis.
- Nao pode atualizar pedidos fora da propria execucao permitida.

## Regras Gerais

- Todo usuario pertence a uma unica empresa.
- Todo acesso a dados deve respeitar o `companyId` do usuario autenticado.
- O backend deve validar autorizacao em rotas protegidas.
- O frontend pode ocultar acoes indisponiveis, mas nao deve ser a fonte de seguranca.
- A API deve retornar apenas os dados permitidos para o papel do usuario.
