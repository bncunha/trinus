# Tela: Dashboard Operacional

## Objetivo

Dar ao Gestor uma visao rapida dos pedidos, riscos, impedimentos e gargalos de producao.

## Usuarios

- Administrador.
- Gestor.

## Conteudo Principal

Indicadores:

- Pedidos em aberto ou em andamento.
- Pedidos para entregar nesta semana.
- Pedidos para entregar na proxima semana.
- Pedidos com criticidade critica.
- Pedidos com impedimento.
- Pedidos atrasados.
- Pedidos com risco de atraso.

Blocos:

- Pedidos mais urgentes.
- Capacidade por setor.
- Alertas importantes.

## Capacidade por Setor

Cada setor deve mostrar:

- Pedidos ativos.
- Quantidade em fila.
- Dias de carga.
- Situacao do setor.

Situacoes iniciais:

- Saudavel: abaixo de 3 dias de carga.
- Atencao: acima de 3 dias de carga.
- Gargalo alto: acima de 5 dias de carga.

Os limites devem ser tratados como parametrizaveis no futuro.

## Comportamento

- Cada indicador deve permitir acesso a lista filtrada correspondente quando fizer sentido.
- Cards devem mostrar contagem como informacao principal.
- Cards podem mostrar no maximo uma linha curta de contexto.
- Cards nao devem conter lista resumida de pedidos.
- A lista de pedidos mais urgentes deve ficar em bloco proprio, fora dos cards.
- Alertas de risco devem ter explicacao curta.
- Pedidos criticos devem ter acesso rapido ao detalhe.
- O dashboard deve priorizar o que precisa de acao.
- O MVP deve ter um unico dashboard operacional, sem separar dashboard de pedidos e dashboard de producao.

## Mobile

- Indicadores em lista vertical.
- Alertas logo abaixo dos indicadores.
- Gargalos e pedidos urgentes em secoes empilhadas.

## Desktop

- Indicadores podem aparecer em grade.
- Alertas, gargalos e pedidos urgentes podem aparecer lado a lado quando houver espaco.

## Estados

- Loading dos indicadores.
- Estado vazio quando ainda nao houver pedidos.
- Erro ao carregar dados.
