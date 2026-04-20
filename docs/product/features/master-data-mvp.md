# Feature: Cadastros Base MVP

## Status

Concluido.

Entregue com banco real:

- Unidades de medida por empresa, com seed inicial de Metro, Peca, Hora e Kilo.
- Variaveis numericas simples.
- Tamanhos de vestuario.
- Clientes.
- Produtos sem categoria.
- Variaveis default no produto.
- Setores produtivos.
- Etapas produtivas com setor, unidade, capacidade por dia util e variavel opcional.
- Templates de producao com etapas em ordem.
- Tela `/configuracoes` com cadastros auxiliares conectados a API real.
- Telas `/clientes` e `/produtos` como cadastros operacionais principais.

## Objetivo

Permitir que cada empresa configure os dados necessarios para cadastrar produtos, montar templates de producao e calcular prazos de pedidos.

## Escopo

- Catalogo de tamanhos de vestuario.
- Catalogo de unidades de medida.
- Variaveis numericas.
- Clientes.
- Produtos.
- Setores.
- Etapas.
- Templates de producao.

## Regras Gerais

- Todos os cadastros pertencem a uma empresa.
- Dados de uma empresa nao podem conflitar nem aparecer para outra empresa.
- Validacoes de unicidade sempre consideram a empresa atual.
- Cadastros auxiliares devem permitir ativar ou inativar registros quando a exclusao puder afetar pedidos existentes.

## Tamanhos de Vestuario

- A empresa pode cadastrar tamanhos usados nos pedidos.
- Exemplos: P, M, G, Tam 1, Tam 2.
- O nome do tamanho nao pode repetir dentro da mesma empresa.
- Tamanhos sao opcionais no item do pedido.
- Tamanhos possuem posicao manual para respeitar a ordem definida pela empresa em grades e selects.

## Unidades de Medida

- A empresa pode cadastrar unidades de medida.
- Cada unidade possui nome e sigla.
- Nome e sigla nao podem repetir dentro da mesma empresa.
- O sistema deve iniciar cada nova empresa com as unidades:
  - Metro.
  - Peca.
  - Hora.
  - Kilo.
- As unidades iniciais devem ser registros editaveis do cadastro da empresa, nao uma lista fixa no codigo.

## Variaveis

- A empresa pode cadastrar variaveis numericas para uso em produtos, etapas e pedidos.
- No MVP, variaveis aceitam apenas valores numericos simples.
- Variaveis nao aceitam formulas no MVP.
- O nome da variavel nao pode repetir dentro da mesma empresa.
- Uma variavel pode ter valor padrao no produto.
- O valor usado no pedido pode sobrescrever o valor padrao do produto.
- Valores de variaveis informados no pedido devem ser positivos e aceitar ate 2 casas decimais.

## Clientes

- A empresa pode cadastrar clientes.
- Campos iniciais:
  - Nome completo.
  - CPF opcional.
  - CNPJ opcional.
  - Endereco opcional.
  - Telefone celular opcional.
  - Telefone fixo opcional.
- O pedido deve permitir selecionar um cliente existente.
- A tela de pedido deve permitir cadastrar um cliente rapidamente quando ele ainda nao existir.
- Clientes ficam no menu principal em `/clientes`, fora de Configuracoes.
- CPF e CNPJ, quando informados, nao podem repetir dentro da mesma empresa.

## Produtos

- A empresa pode cadastrar produtos.
- Campos iniciais:
  - Nome.
  - Custo do produto.
  - Preco de venda.
- Categoria de produto fica fora do MVP.
- O produto pode ter variaveis opcionais com valor padrao.
- O nome do produto nao pode repetir dentro da mesma empresa.
- Produtos ficam no menu principal em `/produtos`, fora de Configuracoes.
- Variaveis padrao do produto devem referenciar variaveis ativas da mesma empresa.
- Variaveis padrao sao opcionais. Quando uma variavel for selecionada no produto, o valor padrao se torna obrigatorio.
- O cadastro de novo produto inicia sem variaveis padrao; o usuario adiciona linhas apenas quando quiser definir defaults.

## Setores

- A empresa pode cadastrar setores produtivos.
- Exemplos: Estamparia, Costura, Corte.
- O nome do setor nao pode repetir dentro da mesma empresa.
- Ao visualizar um setor, o sistema deve permitir consultar suas etapas.
- O sistema deve permitir criar uma etapa a partir do contexto de um setor.
- Setores nao possuem ordenacao manual no MVP; listas podem ser ordenadas por nome.

## Etapas

- A empresa pode cadastrar etapas produtivas.
- Cada etapa pertence a um setor.
- Cada etapa define sua capacidade produtiva.
- A capacidade da etapa deve informar:
  - Unidade de medida.
  - Quantidade produzida por dia util.
  - Variavel opcional para multiplicar a demanda do pedido.
- Exemplo: a etapa Costurar pertence ao setor Costura e produz 100 pecas por dia util.
- Quando a etapa usa variavel, o valor da variavel no pedido deve multiplicar a quantidade do item para calcular a carga daquela etapa.
- Novas etapas so podem selecionar setores, unidades de medida e variaveis ativos.
- Edicoes preservam vinculos antigos mesmo quando o cadastro vinculado foi inativado.

## Templates de Producao

- Template de producao substitui o conceito de tipo de pedido.
- A empresa pode cadastrar templates de producao para pedidos recorrentes.
- Cada template possui nome e uma lista ordenada de etapas.
- Cada item do template deve informar:
  - Ordem.
  - Etapa.
- Exemplo: Producao de Camisa DTF:
  - 1 - Preparacao.
  - 2 - Corte.
  - 3 - Costura.
  - 4 - DTF.
  - 5 - Conferencia.
- O template facilita o cadastro do pedido, mas nao bloqueia ajustes manuais.
- Alterar etapas em um pedido nao altera o template original.
- Novos templates so podem selecionar etapas ativas.
- A ordenacao das etapas no formulario usa botoes `Subir` e `Descer`, com acoes desabilitadas nas extremidades da lista.
- Selects com muitos cadastros possuem filtro local dentro do popup de opcoes.
- Listagens usam menu de tres pontos com acoes Editar, Inativar ou Ativar, e Excluir quando o registro nao tiver dependencia.

## Fora do Escopo

- Categoria de produto.
- Formulas avancadas de variaveis.
- Regras diferentes de capacidade por turno.
- Calendario produtivo complexo.
- Integracoes com estoque, compras ou financeiro.

## Criterios de Aceite

- A empresa consegue cadastrar tamanhos sem duplicidade.
- A empresa consegue cadastrar unidades sem duplicidade de nome ou sigla.
- Nova empresa recebe metro, peca, hora e kilo como unidades iniciais.
- A empresa consegue cadastrar variaveis numericas.
- A empresa consegue cadastrar clientes com CPF, CNPJ, endereco e telefones opcionais.
- A empresa consegue cadastrar produtos sem categoria.
- A empresa consegue associar variaveis default ao produto.
- A empresa consegue cadastrar setores e etapas.
- A empresa consegue montar templates com etapas em ordem.
- Dados cadastrados por uma empresa nao aparecem nem conflitam com outra empresa.
