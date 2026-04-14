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
