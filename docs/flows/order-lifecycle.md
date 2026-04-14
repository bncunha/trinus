# Fluxo do Pedido

## Fluxo Principal

1. O pedido e criado diretamente pelo Gestor.
2. O Gestor seleciona um cliente existente ou cadastra um novo cliente no proprio fluxo.
3. O Gestor adiciona um ou mais produtos ao pedido.
4. Para cada produto, o Gestor informa quantidade geral ou quantidades por tamanho.
5. O Gestor seleciona um template de producao para o item, quando aplicavel.
6. O sistema carrega as etapas do template em ordem.
7. O Gestor pode ajustar etapas do pedido sem alterar o template original.
8. Quando uma etapa exige variavel, o sistema solicita o valor.
9. O sistema sugere valores default a partir do produto, quando existirem.
10. O sistema calcula a carga de cada etapa.
11. O sistema consulta a fila e a capacidade de cada setor.
12. O sistema sugere prazo de entrega considerando dias uteis, 8 horas por dia e gargalo.
13. Se houver prazo prometido, o sistema calcula risco de atraso.
14. O Gestor define ou ajusta a criticidade.
15. A fila considera criticidade, prazo e ajustes manuais.
16. Pedidos com mesma criticidade e mesmo prazo sao ordenados pela data de cadastro mais antiga.
17. Se uma mudanca prejudicar outros pedidos, o sistema alerta o Gestor.
18. O pedido avanca pelas etapas configuradas.
19. Se uma etapa tiver impedimento, o usuario informa o motivo obrigatorio.
20. O pedido passa a sinalizar impedimento.
21. O pedido e finalizado.

## Estados Comuns

- Registrado.
- Em producao.
- Pausado.
- Cancelado.
- Finalizado.

## Datas do Pedido

- Data de entrada: quando o pedido foi registrado no sistema.
- Data de inicio da producao: quando a producao iniciou de fato.
- Prazo prometido: data assumida com o cliente.
- Prazo sugerido: data calculada pelo sistema.

Data de inicio da producao e prazo prometido podem ficar vazios no cadastro inicial.

Quando nao houver prazo prometido, o sistema sugere uma data ideal, mas nao calcula atraso contra promessa.

No MVP, dias uteis ignoram apenas sabado e domingo.

## Visao do Gestor

Gestores devem conseguir visualizar:

- Etapa atual do pedido.
- Proximo passo.
- Prazo sugerido.
- Prazo prometido, quando existir.
- Risco de atraso, quando aplicavel.
- Nivel de risco: baixo, medio ou alto.
- Explicacao curta do risco ou da sugestao.
- Criticidade.
- Setores e etapas envolvidos.
- Gargalos por setor.
- Impedimentos por etapa.
- Impacto de alteracoes na fila.

## Dashboard Operacional

Gestores devem ter acesso a um unico dashboard operacional.

Indicadores iniciais:

- Pedidos em aberto ou andamento.
- Pedidos para entregar nesta semana.
- Pedidos para entregar na proxima semana.
- Pedidos com criticidade critica.
- Pedidos com impedimento.
- Pedidos atrasados.
- Pedidos com risco de atraso.
- Capacidade por setor.
- Pedidos mais urgentes.

Cards do dashboard devem mostrar contagem como informacao principal e nao devem conter lista resumida de pedidos.

Cada indicador deve permitir acesso a lista filtrada quando fizer sentido.

## Visao do Operador

A execucao detalhada por operador fica fora do primeiro MVP.

Quando entrar no escopo, operadores devem visualizar apenas informacoes necessarias para sua propria execucao e nao devem ver dados comerciais sensiveis.
