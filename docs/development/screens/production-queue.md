# Tela: Fila de Producao

## Objetivo

Permitir que o Gestor visualize e ajuste a ordem de execucao dos pedidos.

## Usuarios

- Administrador.
- Gestor.

## Conteudo

Cada item da fila deve mostrar:

- Posicao.
- Numero do pedido.
- Cliente.
- Criticidade.
- Prazo prometido, quando existir.
- Prazo sugerido.
- Setores ou etapas pendentes.
- Risco atual.
- Indicador de impedimento.
- Explicacao curta do risco quando houver.

## Ordenacao

- A fila deve considerar criticidade e prazo.
- Criticidade Critica vem antes de Alta.
- Criticidade Alta vem antes de Media.
- Criticidade Media vem antes de Baixa.
- Pedidos de mesma criticidade e mesmo prazo devem ser desempacados pela data de cadastro mais antiga.
- O Gestor pode ajustar a fila manualmente.

## Acoes

- Reordenar pedidos diretamente.
- Alterar criticidade.
- Abrir detalhe do pedido.
- Confirmar alteracao de ordem.
- Cancelar alteracao de ordem.

## Comportamento

- Ao mover um pedido ou alterar criticidade, o sistema deve recalcular impacto.
- Se a mudanca gerar risco para outros pedidos, o sistema deve informar antes ou durante a confirmacao.
- A explicacao do impacto deve ser curta.

## Exemplo de Mensagem

```txt
Mover este pedido pode atrasar 2 pedidos com entrega nesta semana.
```

## Mobile

- A reordenacao precisa ser simples de usar em tela pequena.
- Se arrastar e soltar nao for claro no mobile, usar acoes como Subir e Descer.

## Desktop

- Pode usar arrastar e soltar quando for claro.
- Deve manter alternativa acessivel para reordenacao.

## Estados

- Loading da fila.
- Fila vazia.
- Erro ao recalcular impacto.
- Confirmacao de reordenacao com risco.
