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
- `/clientes`
- `/produtos`
- `/fila-producao`
- `/configuracoes`
- `/configuracoes/unidades-medida`
- `/configuracoes/variaveis`
- `/configuracoes/tamanhos`
- `/configuracoes/setores`
- `/configuracoes/etapas`
- `/configuracoes/templates-producao`
- `/usuarios`

### Gestor

- `/dashboard`
- `/pedidos`
- `/pedidos/formulario`
- `/pedidos/formulario/:id`
- `/clientes`
- `/produtos`
- `/fila-producao`
- `/configuracoes`
- `/configuracoes/unidades-medida`
- `/configuracoes/variaveis`
- `/configuracoes/tamanhos`
- `/configuracoes/setores`
- `/configuracoes/etapas`
- `/configuracoes/templates-producao`

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
- `GET /users`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`
- `GET /master-data/measurement-units`
- `POST /master-data/measurement-units`
- `PATCH /master-data/measurement-units/:id`
- `DELETE /master-data/measurement-units/:id`
- `GET /master-data/variables`
- `POST /master-data/variables`
- `PATCH /master-data/variables/:id`
- `DELETE /master-data/variables/:id`
- `GET /master-data/sizes`
- `POST /master-data/sizes`
- `PATCH /master-data/sizes/:id`
- `DELETE /master-data/sizes/:id`
- `GET /master-data/sectors`
- `POST /master-data/sectors`
- `PATCH /master-data/sectors/:id`
- `DELETE /master-data/sectors/:id`
- `GET /master-data/stages`
- `POST /master-data/stages`
- `PATCH /master-data/stages/:id`
- `DELETE /master-data/stages/:id`
- `GET /master-data/templates`
- `POST /master-data/templates`
- `PATCH /master-data/templates/:id`
- `DELETE /master-data/templates/:id`
- `GET /master-data/customers`
- `POST /master-data/customers`
- `PATCH /master-data/customers/:id`
- `DELETE /master-data/customers/:id`
- `GET /master-data/products`
- `POST /master-data/products`
- `PATCH /master-data/products/:id`
- `DELETE /master-data/products/:id`

## Regras

- Usuarios nao autenticados devem ser redirecionados para `/login`.
- Usuarios autenticados nao devem acessar `/login` sem antes sair.
- A navegacao deve exibir apenas rotas permitidas para o papel do usuario.
- O item `Dashboard` da navegacao principal deve abrir `/dashboard`.
- O item `Pedidos` da navegacao principal deve abrir `/pedidos`.
- A protecao real das permissoes deve acontecer no backend.
- Cadastros simples como usuarios devem manter uma unica rota de lista e abrir criacao/edicao em drawer.
- Cadastros base do primeiro incremento usam `/configuracoes` como indice e rotas filhas para CRUDs.
- Clientes e produtos sao cadastros operacionais principais e usam rotas proprias fora de Configuracoes.
