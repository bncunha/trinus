# Feature: Controle de Pedidos MVP

## Objetivo

Permitir que Gestores criem pedidos, configurem os itens de producao e recebam apoio do sistema para prazo, risco, criticidade e gargalos.

## Escopo

- Listar pedidos.
- Criar e editar pedido.
- Selecionar ou cadastrar cliente rapidamente.
- Selecionar ou cadastrar produto rapidamente.
- Informar produtos, tamanhos e quantidades.
- Aplicar template de producao ao item do pedido.
- Permitir ajustes manuais nas etapas sugeridas pelo template.
- Informar variaveis numericas exigidas pelas etapas.
- Sugerir prazo de entrega.
- Calcular risco de atraso quando houver prazo prometido.
- Definir criticidade manual.
- Sinalizar pedidos com etapa impedida.
- Exibir dashboard operacional unico.

## Campos Iniciais

- Numero do pedido.
- Cliente.
- Data de entrada.
- Data de inicio da producao opcional.
- Prazo prometido opcional.
- Itens do pedido.
- Tamanhos e quantidades por item.
- Template de producao por item.
- Etapas do pedido.
- Variaveis exigidas pelas etapas.
- Prazo sugerido.
- Risco de atraso.
- Explicacao curta do risco.
- Criticidade.
- Indicador de impedimento.
- Proximo passo recomendado.

## Regras Principais

- O pedido deve ter cliente e ao menos um item valido.
- O pedido pode ser salvo sem data de inicio da producao.
- O pedido pode ser salvo sem prazo prometido.
- Se nao houver prazo prometido, o sistema sugere data ideal, mas nao calcula atraso contra promessa.
- Quantidades devem ser positivas e aceitar ate 2 casas decimais.
- Se nenhum tamanho for informado, a quantidade fica vinculada ao item.
- Template de producao substitui o conceito de tipo de pedido.
- Template aplicado ao pedido pode ser alterado sem alterar o template original.
- O usuario pode comecar a producao do item do zero ou usar um template existente.
- Quando usar template, o sistema preenche as etapas e permite edicao parcial.
- Criticidade ordena a fila e aparece no dashboard.
- Risco de atraso e criticidade sao conceitos diferentes.
- Impedimento pertence a uma etapa do pedido, mas o pedido deve sinalizar quando possui impedimento.
- Impedimento exige motivo obrigatorio.

## Calculo Inicial

- O prazo sugerido deve considerar:
  - Carga de cada etapa.
  - Capacidade produtiva da etapa.
  - Fila de cada setor.
  - Dias uteis.
  - Jornada padrao de 8 horas por dia.
  - Dias uteis ignorando apenas sabado e domingo.
  - Gargalo com maior impacto.
- O sistema deve explicar o prazo sugerido em texto curto.
- Risco deve usar niveis baixo, medio e alto com criterio explicavel.
- O sistema deve alertar quando uma mudanca de criticidade ou fila puder atrasar outros pedidos.

## Dashboard Operacional

- O MVP tera um unico dashboard operacional.
- Cards iniciais:
  - Pedidos em aberto ou em andamento.
  - Pedidos para entregar nesta semana.
  - Pedidos para entregar na proxima semana.
  - Pedidos com criticidade critica.
  - Pedidos com impedimento.
  - Pedidos atrasados.
  - Pedidos com risco de atraso.
- Cada card deve permitir acesso a lista filtrada.
- Cards devem mostrar contagem como informacao principal e, no maximo, uma linha curta de contexto.
- Cards nao devem conter lista resumida de pedidos.
- O dashboard deve mostrar capacidade por setor e pedidos mais urgentes.

## Fora do Escopo Desta Versao

- Categoria de produto.
- Orcamentos.
- Ordens de servico.
- Execucao detalhada por operador.
- Pos-venda.
- Otimizacao automatica completa da fila.
- Formulas avancadas de variaveis.
- Calendario complexo com feriados, excecoes e turnos customizados.
- Permissoes completas por papel.

## Criterios de Aceite

- Gestor consegue visualizar uma lista de pedidos.
- Gestor consegue criar pedido com cliente e itens.
- Gestor consegue cadastrar cliente rapidamente durante o pedido.
- Gestor consegue cadastrar produto rapidamente durante o pedido.
- Pedido criado aparece na lista.
- Pedido exibe prazo sugerido, risco quando aplicavel, criticidade e proximo passo.
- Pedido sinaliza quando possui etapa com impedimento.
- Sistema sugere prazo com base em capacidade, fila, dias uteis e gargalo.
- Sistema explica a sugestao ou risco em texto curto.
- Dashboard operacional exibe os indicadores definidos.
