# Nomenclatura

## Regra Geral

A nomenclatura técnica do projeto deve ser em inglês.

Isso inclui:

- Funções.
- Classes.
- Interfaces.
- Tipos.
- Tabelas.
- Colunas.
- Arquivos técnicos.
- Pastas de código.

## Documentação

A documentação de produto, arquitetura, fluxos e agentes deve ser escrita em português do Brasil.

## CSS

- Estilos globais reutilizáveis devem usar prefixo `app`.
- Exemplos globais: `app-button`, `app-panel`, `app-field`, `app-message`, `app-section-title`.
- Estilos específicos de página ou módulo devem ficar no CSS do próprio componente.
- Prefixos específicos devem refletir a tela ou módulo, como `users-page`, `orders-list`, `order-form`, `app-shell` ou `auth-page`.
- Novos estilos não devem usar o prefixo `orders-app` fora de telas realmente ligadas ao módulo de pedidos.
- Antes de criar uma classe global, o frontend deve validar se ela representa um padrão reutilizável ou apenas comportamento de uma tela.
