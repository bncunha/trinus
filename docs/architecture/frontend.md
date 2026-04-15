# Arquitetura do Front-end

O front-end usa componentes standalone do Angular e rotas como unidade principal de composição. O `AppComponent` fica restrito ao bootstrap visual do router, sem regras de página, estado de formulário ou sincronização manual com URL.

## Estrutura

- `apps/web/src/app/pages`: componentes de página carregados pelas rotas.
- `apps/web/src/app/pages/app-shell`: layout autenticado, navegação principal, topbar e mensagens globais.
- `apps/web/src/app/shared`: componentes e serviços reutilizáveis no front, sem responsabilidade de chamada HTTP.
- `apps/web/src/app/services-api`: services, guards e interceptors ligados a autenticação e chamadas de API.
- Cada componente deve manter seus arquivos no mesmo diretório e contexto: `.component.ts`, `.component.html`, `.component.css` quando houver estilo específico, e `.component.spec.ts`.
- Cada service deve manter seu teste no mesmo diretório: `auth.service.ts` com `auth.service.spec.ts`, `users.service.ts` com `users.service.spec.ts`, e assim por diante.

## Roteamento

As rotas usam `loadComponent` para lazy loading sempre que a tela pode ser carregada sob demanda. O roteamento define qual página aparece em cada URL e substitui a antiga estratégia de sincronização manual por estado (`syncViewWithUrl`).

Rotas públicas:

- `/login`
- `/criar-conta`

Rotas autenticadas:

- `/dashboard`
- `/minha-execucao`
- `/pedidos`
- `/pedidos/dashboard`
- `/pedidos/formulario`
- `/pedidos/formulario/:id`

As rotas autenticadas passam pelo `authGuard`, que verifica a sessão usando `AuthService`. O shell autenticado carrega os pedidos uma vez ao entrar na área privada.

## Responsabilidades

- Páginas mantêm estado e regras da própria tela, como formulários e validações.
- `services-api` concentra chamadas HTTP, normalização de dados recebidos e controle de sessão, mas cada service deve representar um contexto funcional único.
- `AuthService` deve cuidar apenas de autenticação, sessão, login, cadastro, refresh e logout.
- Contextos diferentes devem ter services próprios, como `UsersService` para usuários e `OrdersService` para pedidos.
- `shared` concentra peças reutilizáveis, como `FormFieldErrorComponent`, `ToastService` e `ConfirmDialogService`.
- O shell autenticado cuida de navegação, dados da sessão, logout, carregamento inicial de pedidos e feedback global entre páginas.

## Decisoes

- O `AppComponent` não deve crescer com regras de negócio ou controle de view.
- O `AppComponent` também não deve concentrar testes de páginas, componentes, fluxos ou services.
- Testes devem ficar junto do componente ou service responsável pelo comportamento validado.
- Um teste só deve ficar em `app.component.spec.ts` quando validar responsabilidade direta do `AppComponent`.
- Novas telas devem entrar como componentes em `pages` e serem registradas em `app.routes.ts` com `loadComponent`, salvo quando houver motivo técnico para carregamento eager.
- Componentes compartilhados não devem depender de páginas específicas.
- Services de API não devem renderizar UI; eles expõem dados e operações para páginas, guards, interceptors e shell.
- Feedbacks globais devem usar `ToastService` e o componente global instanciado no `AppComponent`.
- Confirmações de ações devem usar `ConfirmDialogService` e o componente global instanciado no `AppComponent`.
- O `AppComponent` pode instanciar componentes globais sem assumir regra de página.
- Filtros locais podem ficar no componente da página quando a lista for pequena e já estiver carregada inteira no front-end.
- Filtros que exigirem paginação, grande volume de dados ou consulta consistente no servidor devem ser implementados via service de API.

## Estilos

- Estilos específicos de um componente devem ficar no arquivo `.component.css` do próprio componente e ser referenciados por `styleUrl` ou `styleUrls`.
- Estilos globais, tokens, reset, classes utilitárias compartilhadas e padrões realmente reutilizados por múltiplos componentes devem ficar em `apps/web/src/styles.css`.
- O `AppComponent` não deve ser usado como depósito de estilos globais.
- Antes de criar uma classe global, o `frontend-engineer` deve validar se ela é realmente compartilhada por múltiplos componentes.
- Animações estão restritas, por enquanto, a drawer, dialog de confirmação e toast global.

## Testes

- Specs devem ficar no mesmo diretório e contexto do arquivo testado.
- Fluxos de pedidos devem ser testados nos componentes de pedidos, não em `app.component.spec.ts`.
- Fluxos de autenticação devem ser testados nos componentes ou services de autenticação.
- Services de API devem ter specs próprias por contexto.
- Testes integrados amplos só devem existir quando validarem integração real entre partes, e não como substitutos dos testes dos componentes donos do comportamento.

## Mensagens ao Usuário

- Todo texto exibido ao usuário deve estar em português do Brasil com acentuação correta.
- Componentes, páginas e testes de frontend devem preservar acentos em mensagens de validação, erro, sucesso, estados vazios, loading e labels.
- A revisão de frontend deve rejeitar novas mensagens sem acentuação correta.
- Toasts devem receber tipo `success`, `warning` ou `danger`, título e mensagem.
- Quando título ou mensagem não forem informados, o toast deve usar texto padrão seguro.
- Toasts fecham automaticamente em 5 segundos por padrão, com duração parametrizável por chamada.
- Confirmações devem receber título, mensagem, labels quando necessário e callbacks de continuar/cancelar.
