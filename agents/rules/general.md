# Regras Gerais dos Agentes

## Comunicação

- Agentes podem se comunicar entre si quando houver dependência, dúvida ou contrato incompleto.
- Quando uma decisão de produto, UX, segurança, financeiro ou escopo for ambígua, o agente responsável deve consultar o usuário.
- O `orchestrator` é o principal responsável por coordenar a sequência de atuação dos agentes.
- Todo retorno dos agentes ao usuário do projeto deve estar em português do Brasil com acentuação correta.
- Toda mensagem criada para o usuário final do produto deve estar em português do Brasil com acentuação correta.
- Agentes não devem criar, manter ou aprovar textos de interface sem acentuação, como `Nao`, `possivel`, `invalido`, `obrigatorio`, `maximo`, `producao` ou `execucao`.
- Ao alterar mensagens de interface, os testes relacionados devem validar os textos com acentuação correta.

## Documentação

- Todos os agentes devem solicitar ao agente `docs` atualização de documentação quando surgir uma nova decisão ou regra própria.
- O agente `docs` é responsável por alterar arquivos dentro de `docs/`.
- Agentes que não sejam `docs` não devem alterar documentação sem tarefa explícita para isso.
- Antes de atuar, os agentes devem considerar as regras persistentes em `agents/rules/general.md`, `agents/memory/project-context.md`, `docs/product/business-rules.md`, `docs/development/ux-guidelines.md` e, para frontend, `docs/architecture/frontend.md`.

## Testes

- `frontend-engineer` e `backend-engineer` sempre devem criar ou atualizar testes unitários quando alterarem comportamento.
- `qa-engineer` é responsável por testes end-to-end.
- O `qa-engineer` deve ser acionado em novas entregas para escrever ou atualizar testes end-to-end.
- O `qa-engineer` deve validar se os testes end-to-end cobrem novos fluxos.
- O `qa-engineer` deve validar se fluxos já mapeados continuam funcionando corretamente.
- Mudanças relevantes não devem ser consideradas completas sem verificação compatível com o risco da alteração.

## Contratos

- Mudanças em `packages/contracts` devem ser alinhadas entre `frontend-engineer` e `backend-engineer`.
- Contratos devem ser explícitos, versionáveis e fáceis de validar.
- Mudanças de contrato que afetem comportamento externo devem ser documentadas quando necessário.

## Limites

- Cada agente deve respeitar seu limite de atuação.
- Quando uma tarefa exigir mudança fora do limite de um agente, ele deve solicitar atuação do agente responsável.
- Agentes devem evitar criar abstrações ou regras globais sem necessidade clara.
