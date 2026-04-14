# Tela: Configuracoes Operacionais

## Objetivo

Permitir que a empresa configure os cadastros base usados em produtos, templates, pedidos e calculo de prazos.

## Usuarios

- Administrador.
- Gestor, quando tiver permissao de configuracao operacional.

## Areas Iniciais

- Tamanhos de vestuario.
- Unidades de medida.
- Variaveis.
- Setores.
- Etapas.
- Templates de producao.
- Calendario de trabalho simples.

## Tamanhos de Vestuario

Campos:

- Nome.
- Situacao.

Comportamento:

- A empresa pode cadastrar tamanhos como P, M, G, Tam 1 e Tam 2.
- O nome nao pode repetir dentro da mesma empresa.

## Unidades de Medida

Campos:

- Nome.
- Sigla.
- Situacao.

Unidades iniciais por empresa:

- Metro.
- Peca.
- Hora.
- Kilo.

Comportamento:

- Nome e sigla nao podem repetir dentro da mesma empresa.
- As unidades iniciais sao cadastros da empresa e podem ser editadas.

## Variaveis

Campos:

- Nome.
- Descricao opcional.
- Situacao.

Comportamento:

- Variaveis sao numericas no MVP.
- Variaveis nao aceitam formulas no MVP.
- O nome nao pode repetir dentro da mesma empresa.

## Setores

Campos:

- Nome.
- Situacao.

Comportamento:

- A empresa pode cadastrar seus proprios setores.
- Exemplos para confeccao podem ser Corte, Costura, DTF, Sublimacao e Silk.
- O sistema deve permitir visualizar as etapas de um setor.
- O sistema deve permitir criar etapa a partir de um setor.

## Etapas

Campos:

- Nome.
- Setor.
- Unidade de medida.
- Capacidade por dia util.
- Variavel opcional.
- Situacao.

Comportamento:

- A etapa pertence a um setor.
- A capacidade ajuda o sistema a calcular carga e sugerir prazos.
- Quando houver variavel, o pedido deve solicitar o valor dessa variavel.

## Templates de Producao

Campos:

- Nome.
- Descricao opcional.
- Etapas em ordem.
- Situacao.

Comportamento:

- Template de producao substitui o conceito de tipo de pedido.
- O template sugere etapas na criacao do pedido.
- Alteracoes em um pedido especifico nao alteram o template.

## Calendario de Trabalho

Campos iniciais:

- Dias uteis.
- Horas por dia.

Comportamento:

- No MVP, o padrao e dias uteis e 8 horas por dia.
- A tela deve ser pensada para permitir parametrizacao futura sem mudar o fluxo principal.
