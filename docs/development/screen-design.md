# Design das Telas

## Direcao Geral

O MVP deve priorizar telas simples, claras e rapidas de usar.

O sistema deve ser desenhado primeiro para mobile, mas precisa funcionar bem em desktop.

As telas nao devem depender de explicacoes longas. Quando um campo, indicador ou acao puder gerar duvida, a interface deve usar uma instrucao curta no proprio contexto.

## Papeis

### Administrador

Precisa configurar a empresa e os cadastros base.

Telas principais:

- Login.
- Criar nova conta.
- Dashboard operacional.
- Pedidos.
- Fila de producao.
- Configuracoes operacionais.
- Usuarios.

### Gestor

Precisa cadastrar pedidos, acompanhar prazos, riscos, criticidade, impedimentos e gargalos.

Telas principais:

- Login.
- Dashboard operacional.
- Lista de pedidos.
- Formulario de pedido.
- Detalhe do pedido.
- Fila de producao.

### Operador

A visao do Operador fica fora do primeiro MVP.

Quando entrar no escopo, deve ser limitada a informacoes necessarias para execucao.

## Navegacao Inicial

### Publico

- Login.
- Criar nova conta.

### Administrador

- Dashboard.
- Pedidos.
- Fila.
- Configuracoes.
- Usuarios.

### Gestor

- Dashboard.
- Pedidos.
- Fila.

## Telas do MVP

As definicoes detalhadas ficam nos documentos:

- `screens/auth.md`
- `screens/dashboard.md`
- `screens/orders.md`
- `screens/production-queue.md`
- `screens/settings.md`
- `screens/users.md`

## Componentes Base

Componentes iniciais recomendados:

- Cabecalho.
- Navegacao principal.
- Card de indicador.
- Lista de pedidos.
- Item de pedido.
- Badge de situacao.
- Badge de risco.
- Badge de criticidade.
- Badge de impedimento.
- Alerta de impacto.
- Formulario.
- Campo com instrucao.
- Botao primario.
- Botao secundario.
- Modal de confirmacao.
- Estado vazio.
- Estado de loading.
- Estado de erro.

## Indicadores Operacionais

Indicadores devem ser clicaveis quando puderem abrir uma lista filtrada.

Indicadores iniciais:

- Pedidos em aberto ou em andamento.
- Pedidos para entregar nesta semana.
- Pedidos para entregar na proxima semana.
- Pedidos com criticidade critica.
- Pedidos com impedimento.
- Pedidos atrasados.
- Pedidos com risco de atraso.
- Setores com gargalo.

## Risco e Criticidade

- Risco representa chance de nao cumprir o prazo prometido.
- Criticidade representa prioridade operacional.
- A interface deve apresentar risco e criticidade como conceitos diferentes.
- Risco deve ter explicacao curta.
- Mudancas de criticidade ou fila devem mostrar impacto quando puderem prejudicar outros pedidos.
