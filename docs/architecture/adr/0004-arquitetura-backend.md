# ADR 0004: Arquitetura Backend

## Contexto

O backend precisa suportar regras de negócio, multiempresa, contratos de API, banco de dados e evolução do domínio.

## Decisão

O backend será desenvolvido com NestJS e TypeScript.

Regras iniciais:

- Utilizar arquitetura Domain Driven Design.
- Usar nomenclatura em inglês para funções, classes, tabelas, colunas, arquivos técnicos e código.
- Gerar OpenAPI a partir do backend.
- Retornar para o frontend apenas os dados necessários para cada tela.
- Tratar segurança como responsabilidade do backend e do frontend.
- Informar necessidade de mudança de estratégia quando uma decisão prejudicar segurança.

## Consequências

- O domínio deve ser separado de detalhes de infraestrutura.
- Casos de uso e regras de negócio devem ser testáveis.
- O backend deve evitar expor dados desnecessários.
- Contratos de API devem ser claros e documentáveis por OpenAPI.
- Multiempresa deve ser considerada desde a modelagem inicial.

