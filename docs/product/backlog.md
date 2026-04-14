# Backlog do Produto

## Pendencias Conhecidas

### Fechamento da Fase 0: fundacao multiempresa

Status: concluido.

Entregue:

- Persistir empresas e usuarios no MySQL usando Prisma.
- Criar migrations da fundacao multiempresa.
- Substituir o repositorio de contas em memoria por repositorio persistente.
- Validar `role` em runtime.
- Fechar regra de unicidade de e-mail: global como identidade de login.
- Garantir gestao minima de usuarios da propria empresa pelo Administrador.
- Cobrir controllers, guards, roles e telas de autenticacao com testes.

### Persistencia de pedidos no banco

Status: pendente.

Proximo passo esperado:

- Persistir pedidos no MySQL usando Prisma.
- Criar migrations necessarias.
- Ajustar repositorio de pedidos para usar banco.
- Manter testes cobrindo criacao, listagem e detalhe.

### Cadastros base do MVP

Status: pendente.

Proximo passo esperado:

- Implementar tamanhos de vestuario.
- Implementar unidades de medida por empresa.
- Criar unidades iniciais: metro, peca, hora e kilo.
- Implementar variaveis numericas.
- Implementar clientes.
- Implementar produtos sem categoria.
- Implementar setores, etapas e templates de producao.

### Inteligencia inicial de pedidos

Status: pendente.

Proximo passo esperado:

- Calcular carga por etapa.
- Implementar sugestao de prazo com capacidade, fila, dias uteis e gargalo.
- Implementar risco de atraso quando houver prazo prometido.
- Implementar criticidade manual.
- Implementar alerta de impacto ao alterar fila ou criticidade.
- Implementar impedimento por etapa do pedido.
- Implementar dashboard operacional unico.

### Remover fallback local do frontend

Status: pendente.

Hoje o frontend usa `localStorage` como fallback quando a API nao responde.

Proximo passo esperado:

- Definir comportamento oficial para falha de API.
- Remover fallback como fonte de persistencia de pedidos.
- Exibir erro claro quando a API estiver indisponivel.
- Manter o frontend consumindo os dados reais da API.

### Aplicar autenticacao e autorizacao nos endpoints

Status: pendente.

Os endpoints de pedidos ainda nao aplicam autenticacao nem autorizacao.

Proximo passo esperado:

- Proteger rotas com JWT em cookie HTTP-only.
- Aplicar autorizacao por papel.
- Garantir isolamento por empresa.
- Permitir acesso conforme regras de `ADMIN`, `MANAGER` e `OPERATOR`.

### Validar payloads da API

Status: pendente.

Ainda nao ha validacao formal dos dados recebidos pelos endpoints.

Proximo passo esperado:

- Validar payload de criacao de pedido.
- Retornar erros claros e padronizados.
- Garantir que campos obrigatorios sejam informados.
- Garantir que datas, quantidades, produtos, templates e variaveis tenham formato valido.

## Pos-MVP

- Categoria de produto.
- Formulas avancadas de variaveis.
- Otimizacao automatica completa da fila.
- Replanejamento autonomo da producao.
- Calendario complexo com feriados, excecoes e turnos customizados.
- Orcamentos.
- Ordens de servico.
- Execucao detalhada por operador.
- Pos-venda.
- Relatorios analiticos avancados.
