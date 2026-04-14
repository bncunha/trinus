# Workflow: executar QA

## Objetivo

Validar a feature com testes end-to-end e confirmar que os fluxos críticos funcionam como esperado.

## Agente Principal

`qa-engineer`

## Entradas

- Definição da feature.
- Critérios de aceite.
- Especificação de UX.
- Ambiente de teste.
- Instruções de execução.

## Processo

### 1. Planejar cenários

Definir:

- Fluxos principais.
- Fluxos alternativos.
- Casos de erro.
- Dados necessários.
- Pré-condições.

### 2. Criar ou atualizar testes

Criar testes e2e para os fluxos críticos.

Para novas entregas, o agente deve escrever ou atualizar testes end-to-end correspondentes.

Evitar duplicar testes unitários que já validam detalhes internos.

### 3. Executar validação

Executar os testes necessários e registrar:

- O que foi validado.
- O que falhou.
- Como reproduzir falhas.
- Evidências relevantes.
- Se novos fluxos estão cobertos.
- Se fluxos já mapeados continuam funcionando.

### 4. Encaminhar correções

Quando encontrar falha:

- Acionar `frontend-engineer` se o problema estiver na interface.
- Acionar `backend-engineer` se o problema estiver na API, regra de aplicação ou dados.
- Acionar `product-manager` ou `ux-designer` se o comportamento esperado estiver ambíguo.

### 5. Atualizar documentação

Solicitar ao agente `docs` atualização quando houver nova regra de QA, fluxo validado ou decisão relevante.

## Critério de Conclusão

QA é considerado concluído quando:

- Testes e2e necessários foram escritos ou atualizados.
- Fluxos críticos foram validados.
- Novos fluxos foram cobertos.
- Fluxos existentes afetados foram revalidados.
- Falhas foram registradas com passos de reprodução.
- Bloqueios foram encaminhados ao agente responsável.
- Riscos restantes foram comunicados.
