# Roadmap do MVP

## Objetivo

Organizar a ordem de entrega do primeiro MVP por capacidade entregue ao usuario, evitando misturar regra de negocio, backlog e cronograma.

## Premissas

- O MVP deve validar o fluxo `cadastro -> pedido -> sugestao -> fila -> dashboard`.
- Cada fase deve terminar com algo usavel e validavel.
- Regras de negocio ficam em `business-rules.md`.
- Itens fora do MVP ficam em `backlog.md`.
- Perguntas pendentes ficam em `open-questions.md`.
- Feature docs descrevem escopo funcional, sem cronograma.

## Fase 0: Fundacao Multiempresa

## Objetivo

Garantir que usuarios, empresas e dados operacionais nascam com isolamento correto.

## Modulos

- Autenticacao.
- Empresa.
- Usuarios.
- Papeis.
- Isolamento por empresa.

## Entregas

- Criar empresa e primeiro usuario administrador.
- Login.
- Usuario vinculado a uma unica empresa.
- Papeis `ADMIN`, `MANAGER` e `OPERATOR`.
- Filtros e validacoes usando `companyId`.
- Unicidade por empresa em todos os cadastros futuros.

## Dependencias

- Nenhuma fase anterior.

## Criterios de Aceite

- Usuario autenticado acessa apenas dados da propria empresa.
- Cadastros de empresas diferentes nao conflitam.
- Primeiro usuario da empresa nasce como Administrador.

## Fora da Fase

- Cadastros operacionais completos.
- Pedido.
- Calculo de prazo.

## Fase 1: Cadastros Base

Status: concluido.

Entregue:

- CRUD de unidades de medida com seed inicial por empresa.
- CRUD de variaveis numericas simples.
- CRUD de tamanhos.
- CRUD de clientes.
- CRUD de produtos sem categoria.
- Variaveis default no produto.
- CRUD de setores.
- CRUD de etapas com capacidade por dia util.
- CRUD de templates com etapas em ordem.
- Tela de configuracoes operacionais conectada ao banco real.
- Clientes e produtos ficam como itens principais do menu, fora de Configuracoes.

## Objetivo

Permitir que a empresa configure a base necessaria para criar pedidos e templates de producao.

## Modulos

- Tamanhos.
- Unidades de medida.
- Variaveis.
- Clientes.
- Produtos.
- Setores.
- Etapas.
- Templates de producao.

## Entregas

- CRUD de tamanhos.
- CRUD de unidades com seed inicial: metro, peca, hora e kilo.
- CRUD de variaveis numericas simples.
- CRUD de clientes.
- CRUD de produtos sem categoria.
- CRUD de setores.
- CRUD de etapas com capacidade por dia util.
- CRUD de templates com etapas em ordem.
- Inativacao de registros usados por pedidos, quando exclusao causar perda de historico.

## Dependencias

- Fase 0.

## Criterios de Aceite

- Todos os cadastros respeitam a empresa atual.
- Unidades iniciais sao criadas por empresa.
- Variaveis nao aceitam formulas.
- Produto pode ter variaveis default.
- Template de producao pode ser criado com etapas ordenadas.

## Fora da Fase

- Pedido completo.
- Calculo de carga.
- Sugestao de prazo.
- Dashboard.

## Fase 2: Pedido Operacional

Status: concluido.

Entregue:

- Persistencia real de pedidos por empresa.
- Criar e editar pedido com cliente real.
- Itens do pedido vinculados a produto real.
- Quantidade unica ou grade de tamanhos por item.
- Template de producao aplicado por item.
- Etapas copiadas para o item do pedido e editaveis sem alterar o template original.
- Cadastro rapido de cliente e produto no formulario de pedido.
- Lista de pedidos conectada ao backend real.
- Teste E2E real de criacao, edicao e isolamento multiempresa.

## Objetivo

Permitir registrar pedidos reais com cliente, itens, quantidades, tamanhos e producao por item.

## Modulos

- Pedidos.
- Itens do pedido.
- Tamanhos por item.
- Cadastro rapido de cliente.
- Cadastro rapido de produto.
- Template aplicado ao item.
- Lista e detalhe inicial de pedidos.

## Entregas

- Criar e editar pedido.
- Selecionar cliente.
- Cadastrar cliente rapidamente no contexto do pedido.
- Selecionar produto.
- Cadastrar produto rapidamente no contexto do pedido.
- Informar quantidade geral ou quantidades por tamanho.
- O item do pedido deve aceitar quantidade unica ou grade de tamanhos, dependendo do produto e da necessidade do usuario.
- Aplicar template de producao ao item.
- Comecar producao do zero quando nao houver template.
- Editar parcialmente etapas sugeridas pelo template.
- Listar pedidos com informacoes principais.

## Dependencias

- Fase 1.

## Criterios de Aceite

- Pedido nao salva sem cliente e ao menos um item valido.
- Quantidades sao positivas e aceitam ate 2 casas decimais.
- Cliente e produto podem ser criados sem sair do pedido.
- Template preenche etapas, mas nao bloqueia edicao.
- Alterar etapas no pedido nao altera o template original.

## Fora da Fase

- Calculo de prazo.
- Risco de atraso.
- Fila inteligente.
- Dashboard operacional completo.

## Fase 3: Carga, Prazo e Risco Inicial

## Objetivo

Transformar o pedido em uma previsao operacional explicavel.

## Modulos

- Calculo de carga por etapa.
- Sugestao de prazo.
- Risco de atraso.
- Impedimento por etapa.
- Explicacoes curtas.

## Entregas

- Calcular carga usando quantidade e variavel da etapa.
- Usar valor default do produto quando existir.
- Permitir sobrescrever variavel no pedido.
- Sugerir prazo com capacidade, fila, dias uteis e gargalo.
- Considerar dias uteis ignorando apenas sabado e domingo no MVP.
- Calcular risco baixo, medio ou alto quando houver prazo prometido.
- Explicar o motivo do risco.
- Marcar impedimento na etapa com motivo obrigatorio.
- Sinalizar no pedido quando houver etapa impedida.

## Dependencias

- Fase 2.

## Criterios de Aceite

- O sistema calcula carga por etapa.
- O sistema sugere prazo com uma explicacao curta.
- Sem prazo prometido, o sistema sugere data ideal sem marcar atraso contra cliente.
- Risco baixo, medio e alto possuem explicacao objetiva.
- Impedimento nao pode ser salvo sem motivo.

## Fora da Fase

- Reordenacao avancada da fila.
- Alerta de impacto sobre outros pedidos.
- Dashboard completo.

## Fase 4: Fila e Criticidade

## Objetivo

Dar ao Gestor controle operacional sobre prioridade sem perder previsibilidade.

## Modulos

- Fila de producao.
- Criticidade manual.
- Reordenacao.
- Impacto de mudanca.
- Proximo passo recomendado.

## Entregas

- Criticidades: critica, alta, media e baixa.
- Ordenar por criticidade.
- Desempatar pedidos de mesma criticidade e mesmo prazo pela data de cadastro mais antiga.
- Permitir ajuste manual da fila.
- Recalcular risco ao mudar fila ou criticidade.
- Alertar quando passar um pedido na frente puder atrasar outros pedidos.

## Dependencias

- Fase 3.

## Criterios de Aceite

- A fila respeita criticidade.
- Pedidos equivalentes priorizam o pedido cadastrado ha mais tempo.
- Mudancas de fila recalculam risco.
- Impacto em outros pedidos e explicado antes ou durante a confirmacao.

## Fora da Fase

- Otimizacao automatica completa.
- Replanejamento autonomo.

## Fase 5: Dashboard Operacional

## Objetivo

Consolidar em uma tela os principais sinais para decisao do Gestor.

## Modulos

- Dashboard operacional unico.
- Cards clicaveis.
- Capacidade por setor.
- Pedidos urgentes.
- Gargalos.

## Entregas

- Cards com contagem principal e uma linha curta de contexto.
- Cards sem lista embutida.
- Link para lista filtrada ao clicar no card.
- Pedidos em aberto ou em andamento.
- Pedidos para entregar nesta semana.
- Pedidos para entregar na proxima semana.
- Pedidos com criticidade critica.
- Pedidos com impedimento.
- Pedidos atrasados.
- Pedidos com risco de atraso.
- Capacidade por setor.
- Dias de carga por setor.
- Situacao do setor:
  - Saudavel: abaixo de 3 dias.
  - Atencao: acima de 3 dias.
  - Gargalo alto: acima de 5 dias.
- Lista de pedidos mais urgentes fora dos cards.

## Dependencias

- Fases 2, 3 e 4.

## Criterios de Aceite

- Dashboard permite leitura rapida sem abrir detalhes.
- Cada card relevante abre lista filtrada.
- Cards nao viram mini-listas.
- Setores mostram dias de carga e situacao.
- Limites de gargalo ficam preparados para parametrizacao futura.

## Fora da Fase

- BI avancado.
- Graficos complexos.
- Configuracao manual dos limites de gargalo.

## Fase 6: Refinamento Operacional

## Objetivo

Reduzir atrito e aumentar confianca do Gestor apos validar o fluxo principal.

## Modulos

- Filtros.
- Mensagens.
- Parametrizacao simples.
- Ajustes de usabilidade.

## Entregas

- Melhorar filtros da lista de pedidos.
- Refinar explicacoes de risco e prazo.
- Melhorar criterios de pedidos urgentes.
- Preparar parametrizacao de calendario e limites de gargalo.
- Lapidar estados vazios, loading, erro e confirmacao.

## Dependencias

- Fase 5.

## Criterios de Aceite

- Gestor entende por que um pedido esta em risco.
- Gestor entende por que um setor esta em gargalo.
- Ajustes de UI reduzem passos repetitivos sem esconder informacao importante.

## Fora da Fase

- Calendario complexo com feriados.
- Formulas avancadas.
- Otimizacao automatica.

## Pendencias Que Bloqueiam Fases

- Definir criterio exato de risco baixo, medio e alto antes da Fase 3.
- Definir se a fila manual pode ignorar totalmente a ordenacao sugerida antes da Fase 4.
- Definir o formato final dos pedidos mais urgentes antes da Fase 5.

## Regras de Atualizacao

- Alteracoes de ordem de entrega devem ser registradas neste arquivo.
- Alteracoes de regra de negocio devem ser registradas em `business-rules.md`.
- Itens removidos do MVP devem ir para `backlog.md`.
- Duvidas pendentes devem ir para `open-questions.md`.
