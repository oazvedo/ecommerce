# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

Monorepo for "Central de Pedidos", an early-stage B2B/marketplace order platform under active refactor:

- `api/` — .NET 10 Web API (backend)
- `api.Tests/` — xUnit test project for `api/`
- `frontend/` — React 19 + Vite + TypeScript SPA
- `backend.slnx` — solution file referencing `api/api.csproj` (note: `api.Tests` is **not** in the .slnx; run it directly via its `.csproj`)

## Commands

### Backend (`api/`)

```
dotnet restore backend.slnx
dotnet build backend.slnx -c Release
dotnet test api.Tests/api.Tests.csproj -c Release --verbosity quiet
```

Run a single test: `dotnet test api.Tests/api.Tests.csproj --filter "FullyQualifiedName~PedidoServiceTests.MethodName"`

Run the API locally: `dotnet run --project api/api.csproj` (see `api/Properties/launchSettings.json` for ports). Base URL used by the frontend is `http://localhost:5103/api`.

Local infra dependencies (Postgres + RabbitMQ) via `api/docker-compose.dev.yml`. Copy `api/.env.example` to `.env` and `api/appsettings.Example.json` to `appsettings.Development.json` for local secrets (JWT secret, connection strings). Migrations run automatically on startup (`db.Database.MigrateAsync()` in `Program.cs`), followed by `DatabaseSeeder.SeedAsync`.

EF Core migrations: run from `api/` with `dotnet ef migrations add <Name>` / `dotnet ef database update` (requires `dotnet-ef` tool and `Microsoft.EntityFrameworkCore.Design`, already referenced).

### Frontend (`frontend/`)

```
npm install
npm run dev            # vite dev server
npm run build           # tsc -b && vite build
npm run lint             # oxlint
npm run test              # vitest run
npm run test:watch
npx tsc --noEmit -p tsconfig.app.json   # type-check only
```

Run a single test file: `npx vitest run src/components/OrderStatusBadge.test.tsx`

## CI / commit conventions

- GitHub Actions (`.github/workflows/dev.yml`, `prd.yml`) run backend build+test and frontend lint+test on PRs targeting `dev`/`main`, then build/push a Docker image (context `./api`) and — on `main` — deploy via a self-hosted runner (`docker-compose.prod.yml`).
- **`commit-size.yml` fails any non-merge commit that changes more than 500 lines** (excluding `**/Migrations/**`, `*.Designer.cs`, lockfiles, `dist/`, `node_modules/`, `bin/`, `obj/`). Keep commits small and split large changes.
- Feature branches are cut from `dev`; PRs target `dev` (release branch), not `main`.
- CodeRabbit (`.coderabbit.yaml`) auto-reviews PRs against `main`/`dev` with repo-specific instructions — see architecture rules below, which mirror it.

## Backend architecture

Layered: **Controllers → Application/Services → infra/repository → Domain**. Controllers must never touch `DbContext`/EF Core directly — only through repositories injected via `Domain/Interfaces/I*Repository.cs` and implemented in `infra/repository/`. Controllers return DTOs (`Application/DTOs/<Feature>/`), never raw `Domain` entities.

- **Domain** (`api/Domain/`): POCO entities (`Pedido`, `Produto`, `Empresa`, `Usuario`, `Carteira`, ...) plus `Domain/Interfaces` for repository and unit-of-work contracts.
- **Application** (`api/Application/`): `Services/` (business logic, one `I*Service`/`*Service` pair per feature), `DTOs/` (one folder per feature), `Handlers/` (e.g. `Relatorio` report generation), `Jobs/` (Hangfire background jobs), `Consumers/` (MassTransit/RabbitMQ), `Events/`, `Utils/` (e.g. `User.GetId()`/`GetNome()` claims extension helpers used in controllers).
- **infra** (`api/infra/`): `DatabaseContext` (EF Core), `repository/` (implementations, all extend `RepositoryBase<T>`), `Auth/` (JWT + permission-based authorization — see below), `Hangfire/`, `Migrations/`, `Seeds/` (seed data run by `DatabaseSeeder`), `UnitOfWork` (wraps a manual DB transaction via `ExecuteInTransactionAsync` — used to keep multi-step writes atomic, e.g. stock decrement + order creation, wallet balance updates).
- **Mcp** (`api/Mcp/`): exposes `PedidoMcpTools` / `UsuarioMcpTools` over MCP at `/mcp` (`AddMcpServer().WithHttpTransport()`); `api/.claude/settings.json` registers this as an MCP server for Claude Code itself (`http://localhost:5103/mcp`, requires the API running locally).

### Authorization model

Permission-based, not simple roles. `PermissionPolicyProvider` (`infra/Auth/PermissionPolicyProvider.cs`) dynamically resolves any `[Authorize(Policy = "Feature.Action")]` attribute (e.g. `"Produto.Read"`, `"Pedido.UpdateAdmin"`) into a policy requiring that string as a `Permission` claim — there's no need to pre-register policies. `PermissionHandler` checks the claim; permissions are assigned to users via `Cargo` → `CargoPermissao` (role-to-permission) plus optional direct `UsuarioPermissao` grants, managed through `PermissaoController`.

Beyond authentication, endpoints that touch a company-scoped resource must check **ownership/hierarchy**, not just that the caller is authenticated — see `EmpresaService.PodeGerenciarAsync` (a company can manage itself and its direct `filiais`/branches via `EmpresaPaiId`, one level deep) and similar `PodeAcessarAsync`-style checks. When adding endpoints that read/mutate a specific resource by id (pedido, produto, empresa, usuario), always check both `[Authorize(Policy=...)]` and the ownership/scope relationship — this is the #1 thing the repo's CodeRabbit config and code-reviewer agent flag.

Financial/stock integrity: any change touching `PedidoService`, `CarteiraService`, or stock decrement must go through `IUnitOfWork.ExecuteInTransactionAsync` (or the existing atomic repository methods, e.g. `TryDecrementarEstoqueAsync`) — never a non-atomic read-modify-write on saldo/estoque.

### Conventions

- All list endpoints are paginated (`?page=&pageSize=`) returning `PagedResult<T>` (`Application/DTOs/Common`).
- Error responses are `{ "mensagem": "..." }`; enums serialize as strings (`JsonStringEnumConverter` registered in `Program.cs`).
- Namespaces are inconsistently cased across the codebase (`api.application.services.interfaces` vs `api.Application.Services.Interfaces`, `api.domain.interfaces` vs `api.Domain.Interfaces`) — both resolve to the same folders; match whichever the file you're editing already uses rather than "fixing" it.
- `POST /pedido/cancelar` and `POST /usuario` (registration) and `/auth/*` are intentionally `[AllowAnonymous]`-style public endpoints; any new anonymous endpoint should be commented as intentionally public (CodeRabbit flags undocumented anonymous endpoints).
- See `API.md` at the repo root for the full endpoint reference (request/response shapes, policies, status codes, order status state machine, enum values) — check it before hand-rolling a DTO shape from scratch.

## Frontend architecture

Vite + React 19 + TypeScript (strict) + Tailwind v4 + shadcn/ui (`components/ui/`) + Oxlint.

- `src/api/` — one thin typed module per backend feature (`pedidos.ts`, `produtos.ts`, ...), all built on `apiFetch` from `src/api/client.ts`. `client.ts` owns the in-memory access token, auto-retries once on 401 via a shared refresh promise (`configureClient`), and throws `ApiError`. **Never call `fetch` directly or hardcode the API URL/tokens** — always go through an `src/api/*` module.
- `src/context/AuthContext.tsx` — decodes the JWT client-side (no `/me` call) to derive `user`, `role` (`admin`/`lojista`/`cliente` — derived from `Cargo` claim and `Produto.Create` permission, not a literal role field), `hasPermission(perm)`, `empresaId`. Persists only the refresh token (`localStorage`); access token lives in memory via `client.ts`.
- `src/components/ProtectedRoute.tsx` + `useAuth()` gate routes/UI by role/permission — respect this pattern for any new protected page instead of ad hoc checks.
- `src/layouts/AdminLayout.tsx` wraps admin pages (`src/pages/admin/`).
- `src/context/CartContext.tsx`, `FavoritosContext.tsx`, `ThemeContext.tsx` — client-only state (cart, favorites, theme), separate from server state.
- UI copy is in Brazilian Portuguese (pt-BR); keep new user-facing strings consistent with that.
- Tests use Vitest + Testing Library (`src/test/setup.ts`), colocated as `*.test.tsx`/`*.test.ts` next to the source file.
