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
- Lista compartilhada com conteúdo de item dinâmico.
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
- Drawer lateral.
- Toast global de feedback.
- Dialog global de confirmacao.
- Estado vazio.
- Estado de loading.
- Estado de erro.

## Padrao de Cadastro

- CRUDs simples devem priorizar lista principal com formulario em drawer lateral.
- No mobile, o drawer lateral deve virar tela cheia ou sheet.
- CRUDs complexos devem usar pagina propria de formulario.
- Um cadastro e complexo quando tem multiplas secoes, itens dinamicos, regras dependentes entre campos, anexos, calculos, revisao final ou risco operacional relevante.
- Campos com muitas opcoes vindas de outro cadastro devem usar select compartilhado com filtro local dentro do popup, acima das opcoes.
- O filtro de select nao deve aparecer como campo separado no formulario.
- Exemplos: Usuarios usa drawer; Pedidos usa pagina propria.

## Padrao de Acoes em Listas

- A informacao do registro deve ser o foco principal do item da lista.
- A criacao fica como botao primario no topo da tela.
- A acao mais frequente pode aparecer como icone discreto por item no desktop.
- Acoes secundarias e destrutivas devem ficar em menu `Mais opcoes` por item.
- No mobile, preferir apenas o menu `Mais opcoes` com labels textuais completos.
- Acoes no topo apos selecionar itens devem ser reservadas para acoes em lote.
- `Excluir` deve ter confirmacao e menor peso visual que `Editar`.

## Padrao de Filtros em CRUDs

- CRUDs podem ter filtros acima da lista, abaixo do cabecalho da tela.
- Em listas pequenas ja carregadas por empresa, o filtro pode ser local no front-end.
- Em listas grandes, paginadas, com muitos registros ou com custo relevante de memoria, o filtro deve ser feito pela API.
- Filtros iniciais recomendados para usuarios: busca por nome ou e-mail, papel e situacao.
- A tela deve informar a quantidade de registros cadastrados quando nao houver filtros ativos.
- A tela deve informar a quantidade de registros encontrados quando houver filtros ativos.
- `Limpar filtros` deve aparecer apenas quando houver algum filtro ativo.
- O estado vazio de lista sem registros deve ser diferente do estado sem resultados para os filtros.

## Padrao de Listas Reutilizaveis

- Listas com estrutura visual repetida devem usar um componente compartilhado.
- O componente compartilhado deve padronizar container, espacamento, borda, raio e fundo dos itens.
- O conteudo interno de cada item deve ser dinamico por `ng-template`.
- A pagina continua responsavel pelas acoes, menus, badges, regras de permissao e textos especificos do contexto.
- Estados vazios, loading e filtros devem permanecer na pagina quando dependerem da regra daquele fluxo.

## Padrao de Feedback

- Feedbacks de sucesso, alerta e erro devem aparecer como toast global no canto superior direito.
- O toast deve ficar acima de drawers, menus e dialogs.
- O toast deve receber tipo `success`, `warning` ou `danger`, titulo e mensagem.
- O toast deve fechar automaticamente em 5 segundos por padrao.
- A duracao deve ser parametrizavel por chamada.
- O fundo do toast deve representar o tipo: verde para sucesso, amarelo para alerta e vermelho para erro/perigo.
- Quando titulo ou mensagem nao forem informados, o componente deve usar texto padrao.
- Mensagens locais dentro da pagina devem ser usadas apenas quando o feedback fizer parte do conteudo da tela.

## Padrao de Confirmacao

- Acoes destrutivas ou sensiveis devem usar o dialog global de confirmacao.
- O dialog deve receber titulo, mensagem, label de continuar, label de cancelar e callbacks.
- Quando labels nao forem informadas, usar `Continuar` e `Cancelar`.
- `window.confirm` nao deve ser usado em novos fluxos.

## Padrao de Animacao

- Por enquanto, animacoes devem ficar restritas a drawers, dialogs de confirmacao e toasts globais.
- Botoes, campos, cards, listas e menus nao devem usar transicoes ou transformacoes ate nova definicao visual.
- Animacoes permitidas devem ser suaves e curtas, entre 140ms e 220ms.
- Animacoes devem preservar estabilidade do layout e evitar deslocamentos grandes.
- A interface deve continuar funcional sem depender da animacao para explicar o estado.

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
