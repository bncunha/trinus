# Modelo Inicial do Dominio

## Direcao Geral

O dominio deve usar nomenclatura tecnica em ingles.

Mesmo com foco inicial em confeccoes, os nomes internos devem ser genericos quando possivel para permitir expansao futura.

O sistema e multiempresa. Toda entidade operacional deve pertencer a uma `Company` ou ser ligada a uma entidade que pertence a uma `Company`.

## Company

Representa uma empresa cliente do SaaS.

Campos iniciais:

- `id`
- `name`
- `createdAt`
- `updatedAt`

Relacionamentos:

- Possui muitos `User`.
- Possui muitos `Customer`.
- Possui muitos `Product`.
- Possui muitos `Size`.
- Possui muitos `MeasurementUnit`.
- Possui muitos `ProductionVariable`.
- Possui muitos `ProductionSector`.
- Possui muitos `ProductionStep`.
- Possui muitos `ProductionTemplate`.
- Possui muitos `Order`.

## User

Representa uma pessoa que pode acessar o sistema.

Campos iniciais:

- `id`
- `companyId`
- `name`
- `email`
- `passwordHash`
- `role`
- `isActive`
- `createdAt`
- `updatedAt`

Papeis iniciais:

- `ADMIN`
- `MANAGER`
- `OPERATOR`

## Customer

Representa o cliente relacionado a um pedido.

Campos iniciais:

- `id`
- `companyId`
- `fullName`
- `cpf`
- `cnpj`
- `address`
- `mobilePhone`
- `landlinePhone`
- `createdAt`
- `updatedAt`

Regras:

- `cpf`, `cnpj`, `address`, `mobilePhone` e `landlinePhone` sao opcionais.

## Size

Representa um tamanho de vestuario cadastrado pela empresa.

Campos iniciais:

- `id`
- `companyId`
- `name`
- `isActive`
- `createdAt`
- `updatedAt`

Regras:

- `name` deve ser unico por empresa.

## MeasurementUnit

Representa uma unidade de medida cadastrada pela empresa.

Campos iniciais:

- `id`
- `companyId`
- `name`
- `symbol`
- `isActive`
- `createdAt`
- `updatedAt`

Regras:

- `name` deve ser unico por empresa.
- `symbol` deve ser unico por empresa.
- Cada nova empresa deve iniciar com Metro, Peca, Hora e Kilo.

## ProductionVariable

Representa uma variavel numerica usada para calcular carga de producao.

Campos iniciais:

- `id`
- `companyId`
- `name`
- `description`
- `isActive`
- `createdAt`
- `updatedAt`

Regras:

- `name` deve ser unico por empresa.
- No MVP, variaveis aceitam apenas valores numericos simples.
- Formulas ficam fora do MVP.

## Product

Representa um produto vendido pela empresa.

Campos iniciais:

- `id`
- `companyId`
- `name`
- `costPrice`
- `salePrice`
- `isActive`
- `createdAt`
- `updatedAt`

Relacionamentos:

- Possui muitas `ProductVariableDefault`.

Regras:

- Categoria de produto fica fora do MVP.
- `name` deve ser unico por empresa.

## ProductVariableDefault

Representa o valor padrao de uma variavel para um produto.

Campos iniciais:

- `id`
- `productId`
- `variableId`
- `defaultValue`
- `createdAt`
- `updatedAt`

Regras:

- `defaultValue` deve ser positivo e aceitar ate 2 casas decimais.

## ProductionSector

Representa um setor produtivo da empresa.

Campos iniciais:

- `id`
- `companyId`
- `name`
- `isActive`
- `createdAt`
- `updatedAt`

Regras:

- `name` deve ser unico por empresa.

## ProductionStep

Representa uma etapa produtiva.

Campos iniciais:

- `id`
- `companyId`
- `sectorId`
- `name`
- `measurementUnitId`
- `capacityPerBusinessDay`
- `variableId`
- `isActive`
- `createdAt`
- `updatedAt`

Regras:

- Cada etapa pertence a um setor.
- Cada etapa define capacidade por dia util.
- `variableId` e opcional.
- Quando houver `variableId`, a carga do pedido deve multiplicar a quantidade pelo valor da variavel.

## ProductionTemplate

Substitui o conceito de tipo de pedido.

Campos iniciais:

- `id`
- `companyId`
- `name`
- `description`
- `isActive`
- `createdAt`
- `updatedAt`

Relacionamentos:

- Possui muitas `ProductionTemplateStep`.

## ProductionTemplateStep

Representa uma etapa dentro de um template de producao.

Campos iniciais:

- `id`
- `templateId`
- `stepId`
- `sequence`
- `createdAt`
- `updatedAt`

Regras:

- `sequence` define a ordem das etapas no template.

## Order

Representa um pedido.

Campos iniciais:

- `id`
- `companyId`
- `customerId`
- `orderNumber`
- `status`
- `entryDate`
- `productionStartDate`
- `promisedDeliveryDate`
- `suggestedDeliveryDate`
- `riskLevel`
- `riskReason`
- `criticality`
- `hasBlockedStep`
- `nextStep`
- `createdAt`
- `updatedAt`

Status iniciais:

- `REGISTERED`
- `IN_PRODUCTION`
- `PAUSED`
- `CANCELED`
- `FINISHED`

Criticidades iniciais:

- `CRITICAL`
- `HIGH`
- `MEDIUM`
- `LOW`

Niveis iniciais de risco:

- `LOW`
- `MEDIUM`
- `HIGH`

Regras:

- O pedido deve ter cliente.
- `productionStartDate` e opcional.
- `promisedDeliveryDate` e opcional.
- Se nao houver `promisedDeliveryDate`, o sistema sugere prazo ideal sem calcular atraso contra promessa.
- `hasBlockedStep` deve indicar quando alguma etapa do pedido possui impedimento.

## OrderItem

Representa um produto dentro de um pedido.

Campos iniciais:

- `id`
- `orderId`
- `productId`
- `quantity`
- `createdAt`
- `updatedAt`

Relacionamentos:

- Possui muitas `OrderItemSize`.
- Possui muitas `OrderItemStep`.

Regras:

- Quantidade deve ser positiva e aceitar ate 2 casas decimais.
- Quando houver tamanhos, a quantidade pode ser distribuida por tamanho.
- Quando nao houver tamanhos, a quantidade fica vinculada ao item.

## OrderItemSize

Representa a quantidade de um item por tamanho.

Campos iniciais:

- `id`
- `orderItemId`
- `sizeId`
- `quantity`
- `createdAt`
- `updatedAt`

Regras:

- `quantity` deve ser positiva e aceitar ate 2 casas decimais.

## OrderItemStep

Representa uma etapa aplicada a um item do pedido.

Campos iniciais:

- `id`
- `orderItemId`
- `stepId`
- `sequence`
- `calculatedLoad`
- `measurementUnitId`
- `status`
- `isBlocked`
- `blockReason`
- `createdAt`
- `updatedAt`

Regras:

- Pode ser gerada a partir de um `ProductionTemplate`.
- Pode ser ajustada manualmente sem alterar o template.
- Impedimento pertence a etapa do pedido.
- Quando `isBlocked` for verdadeiro, `blockReason` deve ser obrigatorio.

## OrderItemStepVariable

Representa o valor de uma variavel usado em uma etapa do item do pedido.

Campos iniciais:

- `id`
- `orderItemStepId`
- `variableId`
- `value`
- `createdAt`
- `updatedAt`

Regras:

- `value` deve ser positivo e aceitar ate 2 casas decimais.
- Valor informado no pedido prevalece sobre default do produto.

## ProductionQueueItem

Representa a posicao de um pedido na fila.

Campos iniciais:

- `id`
- `companyId`
- `orderId`
- `position`
- `createdAt`
- `updatedAt`

Regras:

- A fila considera criticidade, prazo e ajustes manuais.
- Pedidos com mesma criticidade e mesmo prazo devem ser ordenados pela data de cadastro mais antiga.
- Ao reordenar, o sistema deve recalcular risco e impacto sobre outros pedidos.

## WorkCalendar

Representa a configuracao inicial de calendario da empresa.

Campos iniciais:

- `id`
- `companyId`
- `workingDays`
- `hoursPerDay`
- `createdAt`
- `updatedAt`

Regras:

- No MVP, considera dias uteis e 8 horas por dia.
- No MVP, dias uteis ignoram apenas sabado e domingo.
- A modelagem deve permitir parametrizacao futura.

## Servicos de Dominio Iniciais

## DeliverySuggestionService

Responsavel por sugerir prazo de entrega.

Deve considerar:

- Etapas do pedido.
- Carga calculada por etapa.
- Capacidade das etapas.
- Fila por setor.
- Calendario de dias uteis.
- Gargalo com maior impacto.

## DelayRiskService

Responsavel por calcular risco de atraso.

Deve considerar:

- Prazo prometido.
- Posicao na fila.
- Criticidade.
- Gargalos por setor.
- Impedimentos por etapa.
- Capacidade produtiva.

Saida esperada:

- `riskLevel`
- `riskReason`

## QueueImpactService

Responsavel por simular impacto de mudancas na fila ou criticidade.

Deve informar:

- Pedidos afetados.
- Pedidos que podem entrar em risco.
- Explicacao curta do impacto.

## SectorLoadService

Responsavel por calcular carga por setor para o dashboard operacional.

Deve informar:

- Pedidos ativos no setor.
- Quantidade em fila.
- Dias de carga.
- Situacao: Saudavel, Atencao ou Gargalo alto.

Limites iniciais:

- Saudavel: abaixo de 3 dias de carga.
- Atencao: acima de 3 dias de carga.
- Gargalo alto: acima de 5 dias de carga.

Os limites devem permitir parametrizacao futura.
