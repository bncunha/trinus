# Tela: Configuracoes Operacionais

## Objetivo

Permitir que a empresa configure os cadastros base usados em produtos, templates, pedidos e calculo de prazos.

## Usuarios

- Administrador.
- Gestor, quando tiver permissao de configuracao operacional.

## Areas Iniciais

- Unidades de medida.
- Variaveis.
- Setores.
- Etapas.
- Templates de producao.
- Tamanhos de vestuario, clientes e produtos ficam para o proximo incremento da Fase 1.
- Calendario de trabalho simples fica preparado para fase futura de prazo.

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
- Formularios de nova etapa mostram apenas setores, unidades e variaveis ativos.
- Ao editar uma etapa existente, um vinculo inativo ja selecionado pode continuar visivel para preservar o cadastro antigo.

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
- A ordenacao das etapas usa botoes `Subir` e `Descer` em cada item do template.
- A primeira etapa nao pode subir e a ultima etapa nao pode descer.
- Novos templates mostram apenas etapas ativas como opcoes.

## Implementacao Atual

- `/configuracoes` funciona como indice dos cadastros base.
- Cada card mostra a quantidade de registros cadastrados e abre o CRUD correspondente.
- CRUDs usam lista principal, filtros locais por busca e situacao, formulario em drawer e toast global.
- `Inativar` usa confirmacao e chama exclusao logica no backend.
- Formularios podem ser confirmados com Enter, exceto dentro de campos de texto longo.
- `ADMIN` e `MANAGER` podem gerenciar os cadastros deste incremento.
- O E2E real cobre criacao de unidade inicial por empresa, variavel, setor, etapa e template, incluindo isolamento multiempresa, CRUD completo e bloqueio de opcoes inativas nos novos vinculos.

## Calendario de Trabalho

Campos iniciais:

- Dias uteis.
- Horas por dia.

Comportamento:

- No MVP, o padrao e dias uteis e 8 horas por dia.
- A tela deve ser pensada para permitir parametrizacao futura sem mudar o fluxo principal.
