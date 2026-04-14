# Rotas Iniciais

## Convencao

- Rotas do navegador usam portugues, porque aparecem para o usuario.
- Rotas da API usam ingles, porque sao contratos tecnicos.

## Rotas Publicas do Navegador

- `/login`
- `/criar-conta`

## Rotas Protegidas do Navegador

### Administrador

- `/dashboard`
- `/pedidos`
- `/pedidos/formulario`
- `/pedidos/formulario/:id`
- `/fila-producao`
- `/configuracoes`
- `/usuarios`

### Gestor

- `/dashboard`
- `/pedidos`
- `/pedidos/formulario`
- `/pedidos/formulario/:id`
- `/fila-producao`

### Operador

- Rotas de operador ficam fora do primeiro MVP.

## Rotas Futuras

- `/pos-venda`
- `/minha-execucao`
- `/minha-execucao/pedidos/:id`

## Rotas da API

- `GET /orders`
- `GET /orders/:id`
- `POST /orders`
- `PATCH /orders/:id`

Rotas de API para cadastros base devem ser detalhadas quando a implementacao for planejada.

## Regras

- Usuarios nao autenticados devem ser redirecionados para `/login`.
- Usuarios autenticados nao devem acessar `/login` sem antes sair.
- A navegacao deve exibir apenas rotas permitidas para o papel do usuario.
- O item `Dashboard` da navegacao principal deve abrir `/dashboard`.
- O item `Pedidos` da navegacao principal deve abrir `/pedidos`.
- A protecao real das permissoes deve acontecer no backend.
