# Workflow: definir feature

## Objetivo

Refinar uma nova feature até que ela tenha informações suficientes para ser planejada, implementada, testada e documentada.

## Agente Principal

`product-manager`

## Agentes de Apoio

- `docs`: registra decisões e atualiza a documentação do projeto quando necessário.

## Processo

### 1. Entender a solicitação

Identificar:

- Qual problema precisa ser resolvido.
- Quem será afetado pela feature.
- Qual resultado esperado.
- Se a feature é nova ou alteração de algo existente.

### 2. Separar fatos, suposições e dúvidas

Organizar a conversa em:

- Definido: decisões já tomadas.
- Suposto: hipóteses que parecem prováveis, mas precisam de confirmação.
- Em aberto: perguntas que impedem ou limitam a definição.

### 3. Definir escopo

Registrar:

- O que entra no escopo inicial.
- O que fica fora do escopo.
- O que pode virar melhoria futura.

### 4. Definir regras de negócio

Escrever regras curtas e verificáveis.

Cada regra deve responder:

- Quando ela se aplica.
- O que deve acontecer.
- Quais exceções existem.

### 5. Definir fluxos

Descrever:

- Fluxo principal.
- Fluxos alternativos.
- Casos de erro.
- Estados importantes da feature.

### 6. Definir critérios de aceite

Criar critérios objetivos para validar a entrega.

Cada critério deve permitir responder claramente se a feature está correta ou não.

### 7. Registrar decisões

Quando a definição alterar regras, fluxos, arquitetura ou convenções do projeto, acionar o agente `docs` para atualizar os arquivos necessários dentro de `docs/`.

## Formato de Saída Recomendado

```md
# Feature: Nome da feature

## Resumo

## Problema

## Objetivo

## Escopo Inicial

## Fora de Escopo

## Regras de Negócio

## Fluxo Principal

## Fluxos Alternativos

## Casos de Erro

## Critérios de Aceite

## Perguntas em Aberto

## Riscos e Dependências

## Próximos Passos
```

