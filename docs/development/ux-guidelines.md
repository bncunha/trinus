# Diretrizes de UX

## Regra Geral

O sistema inteiro deve ser simples, coerente e autoexplicativo.

As telas devem ser pensadas primeiro para mobile, sem deixar de funcionar bem em desktop.

O design deve priorizar clareza operacional em vez de densidade de informação.

## Clareza

- Cada tela deve deixar claro o que o usuário pode fazer.
- Campos importantes devem ter rótulos claros.
- Quando um campo ou ação puder gerar dúvida, a interface deve oferecer instrução curta.
- Textos de ajuda devem explicar o necessário sem alongar a tela.
- Estados de erro, vazio, loading e sucesso devem ter mensagens compreensíveis.
- Indicadores de risco devem sempre ter uma explicação curta.

## Validação de Formulários

- Todos os formulários devem exibir mensagens de validação próximas ao campo.
- As mensagens devem usar PT-BR com acentuação correta.
- Essa regra vale para todas as mensagens ao usuário, não apenas validações de formulário.
- Mensagens de validação devem ser padronizadas por componente reutilizável.
- Mensagens iniciais recomendadas:
  - `Campo obrigatório.`
  - `E-mail inválido.`
  - `Valor deve ser maior que X.`
  - `Use no máximo X casas decimais.`
- Erros gerais do formulário podem aparecer acima das ações, mas não substituem o erro específico do campo.

## Coerência

- Comportamentos parecidos devem ter interações parecidas.
- A mesma informação deve ter o mesmo nome em telas diferentes.
- Ações principais devem ser fáceis de encontrar.
- A interface deve evitar excesso de opções na primeira experiência.

## Gestores

- Gestores precisam de visão geral, riscos e próximos passos.
- Informações críticas devem aparecer de forma objetiva.
- Alertas de risco devem explicar brevemente o motivo.
- O dashboard deve permitir entender rapidamente onde está o problema da operação.

## Operadores

- Operadores devem ver apenas o necessário para executar seu trabalho.
- A interface do Operador deve evitar informações comerciais ou sensíveis.
- Instruções de execução devem ser diretas.

## Cadastros e CRUDs

- Todo novo CRUD deve permitir listar, cadastrar, editar e excluir ou desativar registros, conforme a regra de negócio.
- Cadastros simples devem manter a lista como tela principal e abrir o formulário em drawer lateral no desktop.
- No mobile, o drawer deve se comportar como tela cheia ou sheet para preservar espaço e legibilidade.
- Cadastros complexos devem usar página própria de formulário.
- A decisão não deve considerar só quantidade de campos: dependência entre campos, seções, itens dinâmicos, anexos, cálculo, revisão final e risco operacional tornam o cadastro complexo.
- Quando um formulário depender de muitos registros de outro cadastro, o campo deve usar select com busca local dentro do próprio popup de opções.
- Filtros de select devem ficar acima das opções no popup, evitando campos de filtro soltos no formulário.
- Ações destrutivas devem pedir confirmação antes de executar.
- Quando um registro puder ter histórico operacional, a ação principal deve ser desativar/inativar; exclusão física deve ser usada apenas quando a regra permitir.

## Ações em Listas de CRUD

- Listas não devem repetir vários botões textuais em cada item quando isso prejudicar a leitura.
- CRUDs simples devem usar ação principal discreta por item e menu `Mais opções` para ações secundárias.
- No desktop, a ação frequente, como editar, pode aparecer como ícone com `aria-label` e tooltip.
- No mobile, ações por item devem ficar concentradas em menu ou sheet com texto completo.
- Ícones podem simplificar a interface, mas ações ambíguas ou destrutivas devem aparecer com texto no menu.
- Ações destrutivas, como excluir, devem ficar em menu secundário e nunca ter o mesmo peso visual da ação principal.
- Ações no topo após seleção devem ser usadas apenas quando houver seleção em massa ou ação em lote.

## Filtros em CRUDs

- Filtros devem ficar próximos da lista que afetam, preferencialmente acima dos registros.
- A busca textual deve ser o primeiro filtro quando ela existir.
- Filtros locais são aceitáveis quando a lista for pequena e já estiver carregada inteira no front-end.
- A interface deve mostrar a quantidade de registros cadastrados ou encontrados.
- O botão de limpar filtros só deve aparecer quando houver filtro ativo.
- O estado vazio de uma lista sem registros deve ser diferente do estado sem resultados para filtros aplicados.
