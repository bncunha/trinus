# Regras de Negocio

## Comunicação com Usuário

- Toda mensagem exibida ao usuário deve estar em português do Brasil com acentuação correta.
- Todo retorno dos agentes ao usuário do projeto deve estar em português do Brasil com acentuação correta.
- A regra vale para textos de interface, mensagens de erro, validação, sucesso, estados vazios, carregamento, e-mails e notificações.
- A regra também vale para documentação de produto, critérios de aceite, descrições de comportamento e qualquer texto que possa ser copiado para a interface.
- Não devem ser introduzidas mensagens sem acento como `Nao`, `possivel`, `invalido`, `obrigatorio`, `maximo`, `producao`, `execucao` ou equivalentes.
- Testes automatizados que validam mensagens devem esperar os textos com acentuação correta.

## Empresas

- O sistema deve ser multiempresa desde o inicio.
- Um usuario pertence a uma unica empresa.
- Todos os cadastros e pedidos pertencem a uma empresa.
- Dados de uma empresa nao podem aparecer, conflitar ou ser reutilizados por outra empresa.
- Validacoes de unicidade sempre devem considerar a empresa atual.

## Usuarios e Papeis

- No inicio, o sistema tera os papeis Administrador, Gestor e Operador.
- O primeiro usuario criado junto com uma nova empresa sera Administrador.
- O Administrador pode cadastrar novos usuarios para acessar sua propria empresa.
- O Administrador gerencia empresa, usuarios e configuracoes.
- O Gestor gerencia pedidos, fila, producao e decisoes operacionais.
- O Operador fica fora do fluxo principal do primeiro MVP de pedidos inteligentes.
- Usuarios so podem acessar dados da propria empresa.

## Cadastros Base

- A empresa pode cadastrar tamanhos de vestuario.
- A empresa pode cadastrar unidades de medida.
- A empresa pode cadastrar variaveis numericas.
- A empresa pode cadastrar clientes.
- A empresa pode cadastrar produtos.
- A empresa pode cadastrar setores produtivos.
- A empresa pode cadastrar etapas produtivas.
- A empresa pode cadastrar templates de producao.
- Registros usados por pedidos existentes devem poder ser inativados quando a exclusao causar perda de historico.

## Unidades de Medida

- Unidades de medida sao cadastros da empresa, nao valores fixos globais.
- Cada unidade deve ter nome e sigla.
- Nome e sigla nao podem repetir dentro da mesma empresa.
- Cada nova empresa deve iniciar com as unidades:
  - Metro.
  - Peca.
  - Hora.
  - Kilo.
- As unidades iniciais podem ser editadas pela empresa conforme as mesmas regras do cadastro.

## Variaveis

- Variaveis sao parametros numericos reutilizaveis em produtos, etapas e pedidos.
- No MVP, variaveis aceitam apenas valores numericos simples.
- No MVP, variaveis nao aceitam formulas.
- O nome da variavel nao pode repetir dentro da mesma empresa.
- Um produto pode definir valor padrao para uma variavel.
- O pedido pode sobrescrever o valor padrao da variavel.
- O valor informado no pedido prevalece sobre o valor padrao do produto.
- Valores de variaveis devem ser positivos e aceitar ate 2 casas decimais.

## Clientes

- Cliente deve ter nome completo.
- CPF, CNPJ, endereco, telefone celular e telefone fixo sao opcionais.
- O pedido deve permitir selecionar cliente existente.
- O pedido deve permitir cadastrar cliente rapidamente quando ele ainda nao existir.

## Produtos

- Produto deve ter nome, custo do produto e preco de venda.
- Categoria de produto fica fora do MVP.
- Produto pode ter variaveis opcionais com valor padrao.
- O nome do produto nao pode repetir dentro da mesma empresa.
- O pedido deve permitir selecionar produto existente.
- O pedido deve permitir cadastrar produto rapidamente quando ele ainda nao existir.

## Setores

- Setores representam areas produtivas da empresa.
- Exemplos: Estamparia, Costura, Corte.
- O nome do setor nao pode repetir dentro da mesma empresa.
- Ao visualizar um setor, o sistema deve mostrar suas etapas.
- O sistema deve permitir criar etapa a partir do contexto de um setor.

## Etapas

- Etapas representam atividades produtivas.
- Cada etapa pertence a um setor.
- Cada etapa deve definir capacidade produtiva.
- A capacidade deve informar unidade de medida e quantidade produzida por dia util.
- A etapa pode exigir uma variavel para calcular a carga do pedido.
- Quando a etapa exigir variavel, a carga deve multiplicar a quantidade do item pelo valor da variavel.

## Templates de Producao

- Template de producao substitui o conceito de tipo de pedido.
- Template de producao define uma lista ordenada de etapas.
- O template facilita o cadastro de pedidos recorrentes.
- O usuario pode ajustar as etapas em um pedido especifico.
- Alterar etapas no pedido nao altera o template original.

## Pedidos

- Um pedido pertence a uma empresa.
- Um pedido deve ter cliente.
- Um pedido deve ter um ou mais itens.
- Um item de pedido deve ter produto e quantidade.
- Um item pode ter quantidades por tamanho.
- Se nenhum tamanho for informado, a quantidade fica vinculada ao item principal.
- Quantidades devem ser positivas e aceitar ate 2 casas decimais.
- Um item pode usar um template de producao.
- O template aplicado ao item pode ser alterado livremente no pedido.
- O pedido pode ter data de entrada.
- O pedido pode ter data de inicio da producao.
- O pedido pode ter prazo prometido ao cliente.
- Data de inicio da producao e prazo prometido podem ficar vazios no cadastro inicial.

## Prazos

- O sistema deve sugerir prazo de entrega.
- O prazo sugerido nao e uma decisao obrigatoria.
- O usuario pode aceitar o prazo sugerido ou manter outro prazo.
- O prazo prometido e a data assumida com o cliente.
- Quando nao houver prazo prometido, o sistema deve sugerir uma data ideal sem calcular atraso contra promessa.
- A sugestao deve considerar capacidade produtiva, fila, etapas, variaveis, calendario e gargalo.
- No MVP, o calendario considera dias uteis e 8 horas por dia.
- No MVP, dias uteis ignoram apenas sabado e domingo.
- A regra deve ser desenhada para permitir parametrizacao futura do calendario.
- O sistema deve explicar a sugestao em texto curto.

## Capacidade, Carga e Gargalo

- Capacidade produtiva deve ser definida na etapa.
- Carga produtiva deve ser calculada por etapa do pedido.
- A carga deve considerar a quantidade do item e a variavel da etapa quando existir.
- O sistema deve considerar a fila de cada setor ou etapa para sugerir prazo.
- O prazo sugerido deve considerar o gargalo com maior impacto.
- Dias de carga representam quantos dias uteis sao necessarios para concluir a fila considerando a capacidade configurada.

## Criticidade

- Criticidade e prioridade operacional manual.
- Criticidade nao e a mesma coisa que risco de atraso.
- Valores iniciais:
  - Critica.
  - Alta.
  - Media.
  - Baixa.
- A fila deve ordenar pedidos criticos antes dos altos, altos antes dos medios, e medios antes dos baixos.
- Pedidos com mesma criticidade e mesmo prazo devem ser desempacados pela data de cadastro mais antiga.
- A criticidade deve aparecer no dashboard operacional.
- Ao aumentar criticidade ou passar um pedido na frente, o sistema deve alertar se outros pedidos podem ser prejudicados.

## Risco de Atraso

- Risco de atraso representa a chance de nao cumprir o prazo prometido.
- Niveis iniciais:
  - Baixo.
  - Medio.
  - Alto.
- Cada nivel de risco deve ter criterio explicavel.
- Se o pedido nao tiver prazo prometido, o sistema nao deve marcar atraso contra o cliente.
- O risco deve considerar prazo prometido, fila, capacidade, gargalos, criticidade, etapas e impedimentos.
- O risco deve ser recalculado quando mudarem fila, criticidade, capacidade, prazo, etapas, quantidades ou variaveis.
- O risco deve ter explicacao curta.

## Impedimentos

- Impedimento pertence a uma etapa do pedido.
- Impedimento exige motivo obrigatorio.
- Um pedido deve sinalizar quando possui alguma etapa com impedimento.
- Pedidos com impedimento devem aparecer na lista de pedidos e no dashboard operacional.
- Impedimentos devem influenciar risco e proximo passo recomendado.

## Fila de Producao

- A fila deve considerar criticidade e prazo.
- A fila pode ser ajustada manualmente pelo Gestor.
- Ao ajustar a fila, o sistema deve recalcular riscos.
- Ao colocar um pedido na frente, o sistema deve alertar se outros pedidos podem atrasar.
- A alteracao manual de fila nao deve alterar templates de producao.

## Dashboard Operacional

- O MVP deve ter um unico dashboard operacional.
- O dashboard deve ajudar o Gestor a tomar decisoes sobre prazo, fila, risco e gargalos.
- Indicadores iniciais:
  - Pedidos em aberto ou em andamento.
  - Pedidos para entregar nesta semana.
  - Pedidos para entregar na proxima semana.
  - Pedidos com criticidade critica.
  - Pedidos com impedimento.
  - Pedidos atrasados.
  - Pedidos com risco de atraso.
- Cada indicador deve abrir a lista de pedidos filtrada quando fizer sentido.
- Cards do dashboard devem mostrar contagem como informacao principal e, no maximo, uma linha curta de contexto.
- Cards do dashboard nao devem conter lista resumida de pedidos.
- O dashboard deve mostrar capacidade por setor.
- A visao de setor deve mostrar pedidos ativos, quantidade em fila, dias de carga e situacao.
- Situacoes iniciais do setor:
  - Saudavel: abaixo de 3 dias de carga.
  - Atencao: acima de 3 dias de carga.
  - Gargalo alto: acima de 5 dias de carga.
- Os limites de situacao do setor devem ser modelados para parametrizacao futura.
- O dashboard deve exibir os pedidos mais urgentes.

## Fora do Primeiro MVP

- Categoria de produto.
- Formulas avancadas de variaveis.
- Otimizacao automatica completa da fila.
- Replanejamento autonomo da producao.
- Calendario complexo com feriados, excecoes e turnos customizados.
- Orcamentos.
- Ordens de servico.
- Execucao detalhada por operador.
- Pos-venda.
- Financeiro completo.
- Estoque avancado.
- Relatorios analiticos avancados.
