# Workflow: revisar código

## Objetivo

Revisar mudanças antes da entrega para identificar bugs, regressões, riscos e lacunas de teste.

## Agente Principal

`code-reviewer`

## Entradas

- `git diff`.
- Lista de arquivos alterados.
- Descrição da feature.
- Resultado de testes.
- Critérios de aceite.

## Processo

### 1. Entender a mudança

Identificar:

- Objetivo da alteração.
- Áreas afetadas.
- Contratos alterados.
- Testes relacionados.

### 2. Revisar riscos

Verificar:

- Bugs prováveis.
- Regressões.
- Falhas de validação.
- Tratamento de erro.
- Segurança básica.
- Quebras de contrato.
- Impacto em documentação.

### 3. Revisar testes

Confirmar se:

- Frontend e backend atualizaram testes unitários quando alteraram comportamento.
- QA cobre fluxos críticos com testes end-to-end quando aplicável.
- Há lacunas relevantes de teste.

### 4. Produzir feedback

Listar achados por severidade.

Cada achado deve conter:

- Problema.
- Impacto.
- Local afetado quando possível.
- Sugestão de correção.

## Formato de Saída

```md
## Findings

- Severidade: alta|média|baixa
- Local:
- Problema:
- Impacto:
- Sugestão:

## Perguntas

## Resumo

## Riscos Restantes
```

