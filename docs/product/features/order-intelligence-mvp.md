# Feature: Inteligencia de Pedidos MVP

## Objetivo

Ajudar o Gestor a cadastrar pedidos, entender a capacidade necessaria para produzi-los, sugerir prazo de entrega e acompanhar riscos operacionais.

## Escopo

- Cadastro de pedido com cliente e itens.
- Cadastro rapido de cliente e produto durante o pedido.
- Quantidades por tamanho.
- Template de producao editavel por pedido.
- Variaveis numericas por item ou etapa do pedido.
- Sugestao de prazo de entrega.
- Risco de atraso.
- Criticidade manual.
- Impedimento por etapa do pedido.
- Dashboard operacional unico.

## Pedido

- O pedido pertence a uma empresa.
- O pedido deve ter cliente.
- O cliente deve ser selecionado de uma lista.
- Se o cliente nao existir, o usuario deve conseguir cadastra-lo sem sair do fluxo do pedido.
- O pedido pode ter data de entrada.
- O pedido pode ter data de inicio da producao.
- O pedido pode ter prazo prometido ao cliente.
- Data de inicio da producao e prazo prometido podem ficar vazios no cadastro inicial.
- Quando nao houver prazo prometido, o sistema deve sugerir uma data ideal sem calcular risco de atraso contra promessa.

## Itens do Pedido

- Um pedido pode ter um ou mais produtos.
- O produto deve ser selecionado de uma lista.
- Se o produto nao existir, o usuario deve conseguir cadastra-lo sem sair do fluxo do pedido.
- Cada item pode ter tamanhos e quantidades por tamanho.
- Se nenhum tamanho for informado, a quantidade fica vinculada ao proprio item.
- Quantidades devem ser positivas e aceitar ate 2 casas decimais.
- Um item do pedido pode usar um template de producao.
- O template sugerido pode ser alterado livremente no pedido.

## Variaveis no Pedido

- Quando uma etapa do template exigir variavel, o pedido deve solicitar o valor dessa variavel.
- O valor exibido inicialmente deve vir do default do produto, quando existir.
- O usuario pode alterar o valor da variavel no pedido.
- O valor informado no pedido prevalece sobre o default do produto.
- Valores de variaveis devem ser positivos e aceitar ate 2 casas decimais.

## Calculo de Carga

- A carga de cada etapa deve ser calculada a partir da quantidade do item.
- Quando a etapa tiver variavel, a carga deve multiplicar a quantidade pelo valor da variavel.
- Exemplo: 100 pecas com `metros_dtf_por_peca = 0,5` geram 50 metros de carga na etapa DTF.
- A carga calculada deve usar a unidade de medida configurada na etapa.

## Sugestao de Prazo

- O sistema deve sugerir prazo de entrega com base em:
  - Etapas do pedido.
  - Carga calculada por etapa.
  - Capacidade produtiva de cada etapa.
  - Fila existente de cada setor.
  - Calendario de dias uteis.
- No MVP, o calendario considera dias uteis e 8 horas por dia.
- No MVP, dias uteis ignoram apenas sabado e domingo.
- A implementacao futura deve permitir parametrizar o calendario sem redesenhar a regra de negocio.
- O calculo deve considerar o gargalo com maior impacto no prazo.
- A sugestao e apenas apoio a decisao.
- O usuario pode aceitar a sugestao ou manter outro prazo.
- O sistema deve explicar a sugestao com uma frase curta.

## Risco de Atraso

- O risco representa a chance de o pedido nao cumprir o prazo prometido.
- Niveis iniciais: baixo, medio e alto.
- Cada nivel deve ter criterio explicavel e uma frase curta de apoio.
- Se nao houver prazo prometido, o sistema nao deve marcar atraso contra o cliente.
- O risco deve ser recalculado quando mudarem:
  - Prazo prometido.
  - Criticidade.
  - Ordem da fila.
  - Etapas do pedido.
  - Quantidades.
  - Variaveis.
  - Capacidade das etapas.
  - Impedimentos.
- O risco deve ter explicacao curta.
- Exemplo: O setor Costura ja possui 320 pecas na fila desta semana.

## Criticidade

- Criticidade e uma prioridade operacional manual.
- Criticidade nao e a mesma coisa que risco de atraso.
- Valores iniciais:
  - Critica.
  - Alta.
  - Media.
  - Baixa.
- A fila deve priorizar pedidos criticos antes dos altos, altos antes dos medios, e medios antes dos baixos.
- Pedidos com mesma criticidade e mesmo prazo devem ser desempacados pela data de cadastro mais antiga.
- A criticidade deve aparecer como indicador no dashboard operacional.
- Ao alterar a criticidade para passar um pedido na frente, o sistema deve alertar se outros pedidos podem ser prejudicados.

## Impedimentos

- Impedimento pertence a uma etapa do pedido.
- Impedimento exige motivo obrigatorio.
- Um pedido deve sinalizar quando possui uma ou mais etapas com impedimento.
- Pedidos com impedimento devem aparecer na lista de pedidos e no dashboard operacional.
- Impedimento deve influenciar risco e explicacao operacional.

## Dashboard Operacional

- O MVP deve ter um unico dashboard operacional.
- O dashboard deve apoiar decisoes de prioridade, prazo e fila.
- Indicadores iniciais:
  - Pedidos em aberto ou em andamento.
  - Pedidos para entregar nesta semana.
  - Pedidos para entregar na proxima semana.
  - Pedidos com criticidade critica.
  - Pedidos com impedimento.
  - Pedidos atrasados.
  - Pedidos com risco de atraso.
- Cada indicador deve permitir abrir a lista de pedidos filtrada.
- Cards devem mostrar contagem como informacao principal e, no maximo, uma linha curta de contexto.
- Cards nao devem conter lista resumida de pedidos.
- O dashboard deve mostrar capacidade por setor.
- A capacidade por setor deve mostrar:
  - Pedidos ativos no setor.
  - Quantidade em fila.
  - Dias de carga.
  - Situacao do setor.
- Situacoes iniciais do setor:
  - Saudavel: abaixo de 3 dias de carga.
  - Atencao: acima de 3 dias de carga.
  - Gargalo alto: acima de 5 dias de carga.
- Os limites devem permitir parametrizacao futura.
- O dashboard deve exibir uma lista de pedidos mais urgentes.

## Fora do Escopo

- Otimizacao automatica completa da fila.
- Formulas avancadas de variaveis.
- Promessa automatica obrigatoria de prazo.
- Calendario complexo com feriados, excecoes e turnos customizados.
- Execucao detalhada por operador.
- Pos-venda.
- Relatorios analiticos avancados.

## Criterios de Aceite

- O usuario consegue criar pedido com cliente, produtos, tamanhos e quantidades.
- O usuario consegue cadastrar cliente rapidamente durante o pedido.
- O usuario consegue cadastrar produto rapidamente durante o pedido.
- O usuario consegue aplicar um template de producao ao item do pedido.
- O usuario consegue alterar etapas sugeridas pelo template sem alterar o template original.
- O sistema solicita variaveis exigidas pelas etapas.
- O sistema usa default do produto quando existir.
- O sistema calcula carga por etapa.
- O sistema sugere prazo considerando capacidade, fila e dias uteis.
- O sistema explica a sugestao de prazo.
- O sistema calcula risco quando houver prazo prometido.
- O sistema permite criticidade manual e usa criticidade na ordenacao da fila.
- O sistema alerta impacto quando uma mudanca de criticidade ou fila prejudicar outros pedidos.
- O sistema sinaliza pedidos com etapa impedida.
- O dashboard operacional mostra os indicadores iniciais e permite acessar listas filtradas.
