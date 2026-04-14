# ADR 0001: SaaS Operacional Multiempresa

## Contexto

O projeto será um SaaS para empresas que precisam controlar pedidos, produção, entrega e pós-venda.

O nicho inicial será confecção de vestuário, incluindo operações como corte, costura, DTF, sublimação e silk.

Mesmo com esse foco, o sistema deve evitar acoplamento técnico desnecessário a termos específicos da confecção, para permitir expansão futura.

As empresas podem ter operações diferentes, com tipos de pedido, setores, capacidades e etapas próprias. Ao mesmo tempo, o produto precisa ser simples para não dificultar a adoção.

## Decisão

O sistema será multiempresa desde o início.

O produto será tratado como um SaaS de controle operacional para confecções, com inteligência de prazos e produção, não como um ERP completo no MVP.

Cada empresa poderá configurar seus próprios tipos de pedido e etapas operacionais, mantendo algumas etapas comuns para todos os clientes:

- Registrado.
- Pausado.
- Cancelado.
- Finalizado.

No backend e nos contratos internos, a preferência será por termos genéricos como setor, capacidade produtiva, tipo de pedido e unidade de produção.

## Consequências

- A modelagem inicial deve considerar isolamento por empresa.
- Entidades principais devem ter vínculo com a empresa quando fizer sentido.
- Configurações de tipos de pedido, etapas, setores, capacidade produtiva, unidades de produção e calendário devem ser pensadas por empresa.
- A interface deve evitar excesso de configuração para manter a implantação simples.
- O MVP deve priorizar pedidos, prazos, produção e risco de atraso antes de módulos típicos de ERP completo.
- A modelagem de capacidade deve suportar diferentes unidades, como peças por hora e metros por hora.
- O sistema deve permitir templates de pedido, mas também ajustes manuais em pedidos especiais.
