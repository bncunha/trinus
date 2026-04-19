# Development Docs

Convenções de desenvolvimento do projeto.

Conteúdos esperados:

- Padrões de código.
- Estratégia de testes.
- Fluxo de branch e pull request.
- Convenções de commits.
- Regras de revisão.

## Documentos

- `ux-guidelines.md`: diretrizes gerais de UX.
- `screen-design.md`: visão geral das telas do MVP.
- `screens/`: especificações por tela.
- `routes.md`: rotas iniciais do frontend.
- `security.md`: regras iniciais de segurança.
- `naming.md`: regras de nomenclatura.
- `e2e.md`: estrategia de testes E2E reais com banco descartavel.

## Frontend

- Componentes Angular devem manter `.component.ts`, `.component.html`, `.component.css` e `.component.spec.ts` no mesmo diretório quando esses arquivos existirem.
- Testes devem ficar no contexto do componente ou service responsável pelo comportamento testado.
- `app.component.spec.ts` deve validar apenas responsabilidades diretas do `AppComponent`.
- Estilos específicos pertencem ao componente; estilos globais pertencem a `apps/web/src/styles.css`.
- Services de API devem ser separados por contexto funcional, como autenticação, usuários e pedidos.
