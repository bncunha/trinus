# Telas: Pedidos

## Lista de Pedidos

## Objetivo

Permitir que o Gestor encontre e acompanhe pedidos rapidamente.

## Usuarios

- Administrador.
- Gestor.

## Conteudo por Pedido

- Numero do pedido.
- Cliente.
- Situacao atual.
- Data de entrada.
- Data de inicio da producao, quando existir.
- Prazo prometido, quando existir.
- Prazo sugerido.
- Criticidade.
- Risco de atraso.
- Indicador de impedimento.
- Proximo passo.
- Resumo curto dos itens.

## Acoes

- Criar pedido.
- Editar pedido.
- Abrir detalhe do pedido.
- Buscar por numero do pedido ou cliente.
- Filtrar por situacao.
- Filtrar por entrega na semana.
- Filtrar por risco.
- Filtrar por criticidade.
- Filtrar por impedimento.

## Comportamento

- O risco deve ser visivel sem abrir o pedido.
- A criticidade deve ser visivel sem abrir o pedido.
- Pedido com etapa impedida deve ser sinalizado sem abrir o detalhe.
- A lista deve evitar informacoes que nao ajudam decisao rapida.
- A lista nao deve exibir todos os itens do pedido por padrao.
- No mobile, cada pedido deve aparecer como item em lista.
- No desktop, pode usar tabela ou linhas com colunas.

## Criar Pedido

## Objetivo

Permitir criar ou editar um pedido direto usando o mesmo formulario.

## Estrutura da Tela

- A tela deve ser unica, com secoes progressivas.
- A tela nao deve ser um wizard rigido.
- Ordem recomendada:
  - Cliente e datas.
  - Itens do pedido.
  - Producao por item.
  - Inteligencia do pedido.
  - Revisao final.
- Cada item deve aparecer como card expansivel.
- No mobile, as secoes ficam empilhadas e a tela inicia no primeiro bloco.
- No desktop, pode existir um resumo lateral fixo com cliente, prazo sugerido, risco e criticidade.

## Rotas

- Criar: `/pedidos/formulario`.
- Editar: `/pedidos/formulario/:id`.

## Campos Iniciais

- Cliente.
- Codigo do pedido.
- Data de entrada.
- Data de inicio da producao opcional.
- Prazo prometido opcional.
- Itens do pedido.
- Produto por item.
- Tamanhos e quantidades por item.
- Template de producao por item.
- Etapas do item.
- Variaveis exigidas pelas etapas.
- Criticidade.
- Observacoes opcionais.

## Comportamento

- Quando houver `:id`, a tela deve abrir em modo edicao.
- Apos salvar, o usuario volta para `/pedidos`.
- O pedido deve aceitar um ou mais itens.
- Cada item deve ter produto e quantidade.
- Produto deve ser selecionado em dropdown.
- Se o produto nao existir, o usuario deve conseguir cadastra-lo sem sair da tela usando sheet contextual.
- Cliente deve ser selecionado em dropdown.
- Se o cliente nao existir, o usuario deve conseguir cadastra-lo sem sair da tela usando sheet contextual.
- No desktop, o sheet contextual deve abrir como drawer lateral.
- No mobile, o sheet contextual deve abrir em tela cheia.
- Quantidade deve ser maior que zero e aceitar ate 2 casas decimais.
- O usuario pode adicionar e remover itens.
- O sistema nao deve salvar pedido sem item valido.
- O usuario pode informar tamanhos dinamicamente.
- Se nenhum tamanho for informado, a quantidade fica vinculada ao item.
- Ao selecionar template de producao, o sistema carrega as etapas em ordem.
- O usuario pode comecar a producao do item do zero.
- O usuario pode usar template existente como base.
- Quando usar template, deve aparecer o rotulo `Baseado em template`.
- Quando usar template, deve existir acao para restaurar o template original.
- O usuario pode ajustar etapas sem alterar o template original.
- Quando uma etapa exigir variavel, o sistema deve solicitar o valor.
- O valor inicial da variavel deve vir do default do produto, quando existir.
- O usuario pode alterar variaveis com valores positivos e ate 2 casas decimais.
- Apos dados minimos, o sistema pode sugerir prazo e risco.
- Se nao houver prazo prometido, o sistema sugere data ideal sem calcular atraso contra promessa.
- Erros de formulario devem aparecer em alerta vermelho e tambem no campo invalido.
- Impedimento em etapa exige motivo obrigatorio.
- Mensagem para impedimento sem motivo: `Informe o motivo do impedimento para salvar.`

## Instrucoes de UX

- Campo Template de producao deve explicar que serve para sugerir etapas.
- Campo Etapas deve explicar que pode ser ajustado em pedidos especiais.
- Sugestoes do sistema devem aparecer como apoio, nao como decisao obrigatoria.
- Risco e criticidade devem ser apresentados como conceitos diferentes.
- Prazo sugerido deve oferecer as acoes `Usar sugestao` e `Manter prazo atual`.
- Risco deve ter nivel baixo, medio ou alto e sempre explicar o principal motivo.

## Detalhe do Pedido

## Objetivo

Mostrar a situacao completa do pedido para tomada de decisao.

## Conteudo

- Numero do pedido.
- Cliente.
- Produtos.
- Tamanhos e quantidades.
- Situacao atual.
- Etapa atual.
- Proximo passo.
- Data de entrada.
- Data de inicio da producao.
- Prazo prometido.
- Prazo sugerido.
- Criticidade.
- Risco de atraso.
- Explicacao curta do risco.
- Setores e etapas envolvidos.
- Variaveis usadas no calculo.
- Carga calculada por etapa.
- Impedimentos por etapa.
- Historico do pedido.

## Acoes

- Alterar etapa.
- Alterar criticidade.
- Pausar pedido.
- Cancelar pedido.
- Finalizar pedido.
- Ajustar etapas.
- Marcar ou remover impedimento de etapa.
- Ver impacto na fila.

## Comportamento

- Informacoes criticas devem aparecer primeiro.
- Acoes destrutivas devem exigir confirmacao.
- Risco sempre deve ter explicacao curta.
- Historico deve ser consultavel, mas nao deve competir com informacoes principais.

## Criterios de Aceite de UX

- A criacao de pedido funciona no mobile sem zoom ou rolagem lateral.
- Cliente e produto podem ser criados sem sair do pedido.
- A tela nao exige que o usuario entenda todos os blocos de uma vez.
- Template pode ser usado como base e editado parcialmente.
- Prazo sugerido, risco e criticidade ficam sempre visiveis no resumo do pedido.
- Cada estado relevante tem uma frase curta explicando o motivo.
- Impedimento nao pode ser salvo sem motivo.
