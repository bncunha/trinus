# ADR 0003: Arquitetura Frontend

## Contexto

O frontend será responsável por entregar uma experiência simples para gestores e operadores, com foco inicial em uso mobile.

## Decisão

O frontend será desenvolvido em Angular.

Regras iniciais:

- Não utilizar frameworks CSS.
- Utilizar CSS com padrão BEM.
- Utilizar variáveis CSS.
- Desenvolver mobile first.
- Utilizar Atomic Design.
- Reaproveitar componentes sempre que fizer sentido.
- Consumir apenas os dados necessários para cada tela.

## Consequências

- Componentes devem ser organizados para reutilização.
- Estilos devem ser explícitos e mantidos dentro do padrão definido.
- Telas devem ser pensadas primeiro para mobile e depois adaptadas para desktop.
- O frontend deve evitar depender de dados extras que não são exibidos ou necessários para a interação.

