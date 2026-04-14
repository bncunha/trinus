# Contexto Persistente do Projeto

## Regras Obrigatórias

- Todo retorno dos agentes ao usuário do projeto deve estar em português do Brasil com acentuação correta.
- Toda mensagem exibida ao usuário final deve estar em português do Brasil com acentuação correta.
- Essa regra vale para textos de interface, mensagens de validação, erro, sucesso, loading, estados vazios, e-mails e notificações.
- O orquestrador deve repassar essa regra aos subagentes sempre que a tarefa envolver produto, UX, frontend, QA, documentação de comportamento ou mensagens ao usuário.
- Subagentes devem consultar `agents/rules/general.md`, `docs/product/business-rules.md`, `docs/development/ux-guidelines.md` e, em tarefas de frontend, `docs/architecture/frontend.md`.

## Arquitetura Front-end

- O Angular usa páginas em `apps/web/src/app/pages`.
- Componentes, diretivas e serviços reutilizáveis de UI ficam em `apps/web/src/app/shared`.
- Services de chamadas HTTP, guards e interceptors ficam em `apps/web/src/app/services-api`.
- Rotas devem usar a estratégia nativa do Angular, preferencialmente com `loadComponent` para lazy loading.
- O `AppComponent` não deve concentrar regra de página, estado de formulário ou sincronização manual com URL.
