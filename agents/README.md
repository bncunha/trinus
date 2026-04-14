# Agents

Documentação operacional para agentes que ajudam no desenvolvimento do projeto.

Esta pasta define papéis, regras, fluxos de trabalho e memória operacional. Ela não é, inicialmente, um runtime de agentes.

Estrutura:

- `roles/`: responsabilidades de cada agente.
- `workflows/`: processos que agentes devem seguir em tarefas recorrentes.
- `rules/`: regras gerais de atuação.
- `memory/`: contexto persistente e resumos úteis do projeto.

Antes de iniciar uma tarefa, o `orchestrator` e os subagentes devem considerar `rules/general.md` e `memory/project-context.md` como contexto persistente do projeto.
