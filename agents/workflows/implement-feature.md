# Workflow: implementar feature

## Objetivo

Conduzir uma feature desde a definição inicial até implementação, revisão, QA e documentação.

## Agente Principal

`orchestrator`

## Processo

### 1. Refinar a feature

Acionar `product-manager` quando a solicitação ainda não tiver:

- Objetivo claro.
- Escopo inicial.
- Regras de negócio.
- Critérios de aceite.
- Perguntas em aberto mapeadas.

### 2. Definir experiência

Acionar `ux-designer` quando a feature envolver tela, interação ou fluxo de usuário.

O resultado esperado é uma definição de:

- Comportamento da tela.
- Estados da interface.
- Fluxo principal.
- Fluxos alternativos.
- Casos de erro.

### 3. Alinhar contratos

Quando houver comunicação entre frontend e backend, alinhar `frontend-engineer` e `backend-engineer` sobre:

- Dados necessários.
- Endpoints.
- Tipos de request e response.
- Validações.
- Erros esperados.

Mudanças compartilhadas devem ser registradas em `packages/contracts`.

### 4. Implementar backend

Acionar `backend-engineer` quando houver:

- Endpoint novo ou alterado.
- Regra de aplicação.
- Banco de dados.
- Validação de entrada.
- Contrato de API.

O backend deve criar ou atualizar testes unitários quando houver mudança de comportamento.

### 5. Implementar frontend

Acionar `frontend-engineer` quando houver:

- Tela nova ou alterada.
- Integração com API.
- Estado de interface.
- Componente ou fluxo Angular.

O frontend deve criar ou atualizar testes unitários quando houver mudança de comportamento.

### 6. Atualizar documentação

Acionar `docs` quando houver:

- Nova regra de negócio.
- Nova decisão técnica.
- Mudança de fluxo.
- Mudança de contrato relevante.
- Nova regra de UX, frontend, backend ou QA.

### 7. Revisar código

Acionar `code-reviewer` antes de considerar a feature pronta.

A revisão deve verificar:

- Bugs e regressões.
- Testes.
- Contratos.
- Segurança básica.
- Aderência às regras do projeto.
- Pendências de documentação.

### 8. Validar end-to-end

Acionar `qa-engineer` para validar os fluxos principais e casos relevantes.

O `qa-engineer` deve:

- Escrever ou atualizar testes end-to-end para a entrega.
- Verificar se novos fluxos estão cobertos.
- Verificar se fluxos já mapeados continuam funcionando corretamente.
- Reportar lacunas de cobertura e riscos restantes.

## Critério de Conclusão

A feature só deve ser considerada concluída quando:

- Escopo e regras estiverem claros.
- UX estiver definido quando houver tela.
- Frontend e backend estiverem implementados quando aplicável.
- Testes unitários necessários estiverem atualizados.
- QA e2e tiver testes escritos ou atualizados para a entrega.
- QA e2e tiver validado fluxos novos e fluxos existentes afetados.
- Code review não tiver bloqueios.
- Documentação necessária estiver atualizada.
