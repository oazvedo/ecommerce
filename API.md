# API Documentation — Central de Pedidos

Base URL: `http://localhost:5103/api`

All protected endpoints require a Bearer JWT token in the `Authorization` header:

```
Authorization: Bearer {access_token}
```

---

## Common Patterns

### Pagination

All list endpoints are paginated via query params `?page=1&pageSize=10`.

```json
{
  "page": 1,
  "pageSize": 10,
  "totalCount": 42,
  "totalPages": 5,
  "items": [...]
}
```

### Standard Error Shape

```json
{ "mensagem": "Descrição do erro." }
```

### HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `204` | No Content (success, no body) |
| `400` | Bad Request (validation / business rule) |
| `401` | Unauthorized (missing or invalid token) |
| `404` | Not Found |
| `409` | Conflict (duplicate) |

---

## Authentication

### POST `/auth/login`

No authentication required.

**Request**
```json
{
  "email": "usuario@email.com",
  "password": "senha123"
}
```

**Response `200`**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "dGhpcyBpcyBh...",
  "token_type": "Bearer"
}
```

**Response `401`** — credentials invalid.

> **Frontend:** store `access_token` in memory (not localStorage) and `refresh_token` in an httpOnly cookie or secure storage. Decode the JWT to read user info without an extra API call.

---

### POST `/auth/refresh`

No authentication required. Exchange an expired access token for a new pair.

**Request**
```json
{
  "refreshToken": "dGhpcyBpcyBh..."
}
```

**Response `200`** — same shape as `/auth/login` (new access_token + new refresh_token).

**Response `401`** `{ "mensagem": "Refresh token inválido ou expirado." }`

> **Frontend:** call this automatically when any request returns `401`. Retry the original request with the new token.

---

### POST `/auth/revoke`

Requires Bearer auth. Call on logout to invalidate the refresh token server-side.

**Request**
```json
{
  "refreshToken": "dGhpcyBpcyBh..."
}
```

**Response `204`**

---

### JWT Claims

The decoded JWT payload contains:

| Claim | Value |
|-------|-------|
| `sub` | userId (uuid) |
| `email` | user email |
| `unique_name` | user full name |
| `Permission` | one entry per permission e.g. `"Pedido.Read"` |

> **Frontend:** decode the JWT on the client to determine which UI elements to show/hide based on `Permission` claims — no extra `/me` endpoint needed.

---

## Frontend Flows

### E-commerce Order Flow

```
1. POST /auth/login          → store tokens, decode JWT
2. GET  /produto             → list product catalog
3. GET  /produto/{id}        → product detail page
4. POST /pedido              → create order (checkout)
5. GET  /pedido/meus         → order history (my orders)
6. GET  /pedido/{id}         → order detail / tracking
7. PATCH /pedido/{id}/status → update order status (operator/admin)
```

### Wallet Top-up Flow

```
1. GET  /carteira/minha-carteira     → current balance
2. PUT  /carteira/update-my-balance  → add funds (optional cupom)
```

### Admin Order Management Flow

```
1. GET /pedido?status=Criado         → filter orders by status
2. GET /pedido/relatorio             → sales report for date range
3. PUT /pedido/{id}                  → full update (status + items + contratacao)
4. DELETE /pedido/{id}               → remove order
```

---

## Order Status State Machine

```
           Criado
             │
             ▼
      EmProcessamento
             │
       ┌─────┴─────┐
       ▼           ▼
   Suporte     Finalizado
       │
       ▼
   Cancelado  ◄── can also transition from any status
```

| Status | Description | Allows further updates? |
|--------|-------------|------------------------|
| `Criado` | Order just placed | Yes |
| `EmProcessamento` | Being fulfilled | Yes |
| `Suporte` | Needs attention | Yes |
| `Finalizado` | Delivered/done | Yes |
| `Cancelado` | Cancelled | **No** — any attempt returns `400` |

> `POST /pedido/cancelar` is the public cancel endpoint (no auth required — for customer self-cancel links).

---

## Usuários

### Usuario Object

```json
{
  "id": "uuid",
  "nome": "João Silva",
  "email": "joao@email.com",
  "status": "Ativo",
  "cargo": "Operador",
  "empresa_id": "uuid",
  "criado_em": "2024-01-15T10:00:00Z",
  "atualizado_em": null
}
```

---

### GET `/usuario`
Policy: `Usuario.Read` — paged.

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Usuario>`.

---

### GET `/usuario/{id}`
Policy: `Usuario.Read`

**Response `200`** — usuario object.  
**Response `404`**

---

### POST `/usuario`

No authentication required. Registration endpoint.

**Query param:** `?cargo=Operador` (see `UsuarioCargo` enum — pass the name or int value)

**Request**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "empresaId": "uuid"
}
```

**Response `201`** — created usuario object.

---

### PUT `/usuario/{id}`
Policy: `Usuario.Update`

**Request**
```json
{
  "nome": "João Silva Atualizado",
  "email": "joao@email.com"
}
```

**Response `204`**  
**Response `404`**

---

### PUT `/usuario/{id}/password`
Policy: `Usuario.PasswordUpdate`

**Request**
```json
{
  "password": "novaSenha123"
}
```

**Response `204`**  
**Response `404`** `{ "mensagem": "Usuário não encontrado." }`

---

### PATCH `/usuario/{id}/email`
Policy: `Usuario.EmailUpdate`

**Request**
```json
{
  "email": "novo@email.com"
}
```

**Response `200`** — updated usuario object.  
**Response `404`**

---

### DELETE `/usuario/{id}`
Policy: `Usuario.Delete`

**Response `204`**  
**Response `404`**

---

## Produtos

### Produto Object

```json
{
  "id": "uuid",
  "nome": "Produto A",
  "descricao": "Descrição do produto",
  "codigo": "COD-001",
  "status": true,
  "preco": 99.90,
  "empresaId": "uuid",
  "criadoEm": "2024-01-15T10:00:00Z",
  "atualizadoEm": null
}
```

> `status: true` = active/available for purchase. Filter out `false` items on the catalog page.

---

### GET `/produto`
Policy: `Produto.Read` — paged.

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Produto>`.

---

### GET `/produto/{id}`
Policy: `Produto.Read`

**Response `200`** — produto object.  
**Response `404`** `{ "mensagem": "Produto não encontrado." }`

---

### POST `/produto`
Policy: `Produto.Create` — `empresaId` is derived from the authenticated user's token.

**Request**
```json
{
  "nome": "Produto A",
  "descricao": "Descrição do produto",
  "preco": 99.90,
  "codigo": "COD-001",
  "status": true
}
```

**Response `201`** — created produto object.  
**Response `404`** `{ "mensagem": "Usuário não encontrado." }`

---

### PUT `/produto/{id}`
Policy: `Produto.Update`

**Request** — same shape as `POST /produto`.

**Response `200`** — updated produto object.  
**Response `404`** `{ "mensagem": "Produto não encontrado." }`

---

### DELETE `/produto/{id}`
Policy: `Produto.Delete`

**Response `204`**  
**Response `404`** `{ "mensagem": "Produto não encontrado." }`

---

## Pedidos

### Pedido Object

```json
{
  "id": "uuid",
  "status": "Criado",
  "contratacao": "Mensal",
  "valor_total": 299.70,
  "empresa_id": "uuid",
  "empresa_nome": "Empresa X",
  "empresa_cnpj": "00.000.000/0001-00",
  "usuario_id": "uuid",
  "usuario_nome": "João Silva",
  "itens": [
    {
      "ProdutoId": "uuid",
      "NomeProduto": "Produto A",
      "Quantidade": 3,
      "PrecoUnitario": 99.90,
      "Subtotal": 299.70
    }
  ],
  "criado_em": "2024-01-15T10:00:00Z",
  "atualizado_em": null
}
```

---

### GET `/pedido/relatorio`
Policy: `Pedido.Read` — sales summary for a date range. Use on admin dashboard.

**Query params:** `?data_inicio=2024-01-01T00:00:00Z&data_fim=2024-01-31T23:59:59Z`

**Response `200`**
```json
{
  "produto_mais_vendido": "Produto A",
  "total_de_vendas": 42,
  "total_de_valor_vendas": 4199.80,
  "maior_valor_de_venda": 299.70,
  "cliente_mais_frequente": "João Silva",
  "tipo_de_contratacao_mais_utilizado": "Mensal"
}
```

---

### GET `/pedido`
Policy: `Pedido.Read` — paged with optional filters. Use on admin order list.

**Query params:** `?page=1&pageSize=10&status=Criado&contratacao=Mensal&usuarioId=uuid`

All filters are optional and combinable.

**Response `200`** — `PagedResult<Pedido>`.

---

### GET `/pedido/{id}`
Policy: `Pedido.Read`

**Response `200`** — pedido object.  
**Response `404`** `{ "mensagem": "Pedido não encontrado." }`

---

### GET `/pedido/empresa/{empresaId}`
Policy: `Pedido.Read` — paged, all pedidos for a specific empresa.

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Pedido>`.

---

### GET `/pedido/empresa/cnpj/{cnpj}`
Policy: `Pedido.Read` — paged, lookup by CNPJ.

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Pedido>`.

---

### GET `/pedido/usuario/{usuarioId}`
Policy: `Pedido.Read` — paged, all pedidos for a specific user.

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Pedido>`.

---

### GET `/pedido/meus`
Policy: `Pedido.Read` — paged, pedidos of the authenticated user (userId extracted from JWT `sub` claim).

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Pedido>`.

> **Frontend:** use this on the "My Orders" / order history page.

---

### POST `/pedido`
Policy: `Pedido.Create` — creates an order for the authenticated user. This is the **checkout** endpoint.

**Request**
```json
{
  "empresa_id": "uuid",
  "contratacao": "Mensal",
  "itens": [
    {
      "produto_id": "uuid",
      "quantidade": 3
    }
  ]
}
```

**Response `201`** — created pedido object.  
**Response `404`** `{ "mensagem": "Produto '{id}' não encontrado." }` — if any product doesn't exist.

---

### PUT `/pedido/{id}`
Policy: `Pedido.UpdateAdmin` — full update (status, contratacao, and items). Admin only.

**Request**
```json
{
  "status": "EmProcessamento",
  "contratacao": "Anual",
  "itens": [
    {
      "produto_id": "uuid",
      "quantidade": 1
    }
  ]
}
```

**Response `204`**  
**Response `404`** `{ "mensagem": "Pedido não encontrado." }`

---

### PATCH `/pedido/{id}/status`
Policy: `Pedido.Update` — updates only the status.

**Request**
```json
{
  "status": "EmProcessamento"
}
```

**Response `200`** — updated pedido object.  
**Response `400`** `{ "mensagem": "Pedidos cancelados não podem ter atualização de status" }`  
**Response `404`** `{ "mensagem": "Pedido não encontrado." }`

---

### PATCH `/pedido/{id}/contratacao`
Policy: `Pedido.Update` — updates only the contratacao type.

**Request**
```json
{
  "contratacao": "Anual"
}
```

**Response `200`** — updated pedido object.  
**Response `400`** `{ "mensagem": "Pedidos cancelados não podem ter atualização de status" }`  
**Response `404`** `{ "mensagem": "Pedido não encontrado." }`

---

### POST `/pedido/cancelar`

No authentication required. Public cancel link (e.g., email unsubscribe-style cancel button).

**Query param:** `?id=uuid`

**Response `200`** — updated pedido object.  
**Response `400`** `{ "mensagem": "..." }`  
**Response `404`** `{ "mensagem": "Pedido não encontrado." }`

---

### DELETE `/pedido/{id}`
Policy: `Pedido.Delete`

**Response `204`**  
**Response `404`** `{ "mensagem": "Pedido não encontrado." }`

---

## Carteira

### Carteira Object

```json
{
  "id": "uuid",
  "usuario_id": "uuid",
  "usuario_nome": "João Silva",
  "usuario_email": "joao@email.com",
  "saldo": 150.00,
  "criado_em": "2024-01-15T10:00:00Z",
  "atualizado_em": null
}
```

---

### GET `/carteira`
Policy: `Carteira.Read` — paged. Admin view of all wallets.

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Carteira>`.

---

### GET `/carteira/minha-carteira`
Policy: `Carteira.Read` — returns the wallet of the authenticated user (from JWT).

**Response `200`** — carteira object.  
**Response `404`**

> **Frontend:** use on the user's wallet/balance page.

---

### GET `/carteira/{id}`
Policy: `Carteira.Read`

**Response `200`** — carteira object.  
**Response `404`**

---

### PUT `/carteira/{id}`
Policy: `Carteira.Update` — updates saldo by wallet ID. Admin use.

**Request**
```json
{
  "saldo": 200.00,
  "cupom": "DESCONTO10"
}
```

`cupom` is optional.

**Response `200`** — updated carteira object.  
**Response `404`** `{ "mensagem": "..." }`

---

### PUT `/carteira/update-my-balance`
Policy: `Carteira.Update` — updates the saldo of the authenticated user's carteira (from JWT).

**Request** — same shape as `PUT /carteira/{id}`.

**Response `200`** — updated carteira object.  
**Response `404`** `{ "mensagem": "..." }`

> **Frontend:** use this on the "Add Funds" / wallet top-up screen.

---

## Empresa

### Empresa Object

```json
{
  "empresa_id": "uuid",
  "empresa_nome": "Empresa X",
  "empresa_cnpj": "00.000.000/0001-00",
  "empresa_responsavel": "João Silva",
  "empresa_responsavel_id": "uuid",
  "empresa_telefone": "(11) 99999-9999",
  "empresa_tipo": "Central",
  "empresa_status": true,
  "empresa_criado_em": "2024-01-15T10:00:00Z",
  "empresa_atualizado_em": null
}
```

---

### GET `/empresa`
Policy: `Empresa.Read` — paged.

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Empresa>`.

---

### GET `/empresa/{id}`
Policy: `Empresa.Read`

**Response `200`** — empresa object.  
**Response `404`** `{ "mensagem": "Empresa não encontrada." }`

---

### POST `/empresa`
Policy: `Empresa.Create` — `responsavel` and `responsavel_id` are derived from the authenticated user's JWT claims.

**Request**
```json
{
  "nome": "Empresa X",
  "cnpj": "00.000.000/0001-00",
  "telefone": "(11) 99999-9999",
  "tipo": "Central",
  "status": true
}
```

**Response `201`** — created empresa object.

---

### PUT `/empresa/{id}`
Policy: `Empresa.Update`

**Request**
```json
{
  "nome": "Empresa X Atualizada",
  "cnpj": "00.000.000/0001-00",
  "responsavel": "Maria Silva",
  "responsavel_id": "uuid",
  "telefone": "(11) 88888-8888",
  "tipo": "Filial",
  "status": true
}
```

**Response `200`** — updated empresa object.  
**Response `404`** `{ "mensagem": "Empresa não encontrada." }`

---

### DELETE `/empresa/{id}`
Policy: `Empresa.Delete`

**Response `204`**  
**Response `404`** `{ "mensagem": "Empresa não encontrada." }`

---

## Permissões

### Permissao Object

```json
{
  "id": "uuid",
  "nome": "Pedido.Read",
  "descricao": "Permite leitura de pedidos"
}
```

---

### GET `/permissao`
Policy: `Permissao.Read` — paged.

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Permissao>`.

---

### GET `/permissao/usuario/{usuarioId}`
Policy: `Permissao.Read` — returns all permissions assigned to a user (not paged, returns full array).

**Response `200`** — array of permissao objects.

---

### POST `/permissao/usuario/{usuarioId}/{permissaoId}`
Policy: `Permissao.Assign` — assigns a permission to a user.

**Response `204`**  
**Response `409`** `{ "mensagem": "Usuário ou permissão não encontrado, ou permissão já atribuída." }`

---

### DELETE `/permissao/usuario/{usuarioId}/{permissaoId}`
Policy: `Permissao.Remove` — removes a specific permission from a user.

**Response `204`**  
**Response `404`** `{ "mensagem": "Vínculo entre usuário e permissão não encontrado." }`

---

### DELETE `/permissao/usuario/{usuarioId}`
Policy: `Permissao.RemoveAll` — removes all permissions from a user.

**Response `204`**  
**Response `404`** `{ "mensagem": "Usuário não encontrado ou sem permissões atribuídas." }`

---

## Enums

Enum values are serialized as strings by name.

### PedidoStatus
| Value | Name | Description |
|-------|------|-------------|
| `0` | `Cancelado` | Cancelled — no further updates allowed |
| `1` | `Criado` | Just placed |
| `2` | `EmProcessamento` | Being fulfilled |
| `4` | `Suporte` | Needs attention |
| `5` | `Finalizado` | Completed |

### PedidoTipoContratacao
| Value | Name |
|-------|------|
| `1` | `Mensal` |
| `2` | `Anual` |

### UsuarioStatus
| Value | Name |
|-------|------|
| `0` | `Desativado` |
| `1` | `Ativo` |

### UsuarioCargo
| Value | Name |
|-------|------|
| `1` | `Operador` |
| `2` | `Administrador` |
| `3` | `Gerente` |
| `4` | `Diretor` |

### EmpresaTipo
| Value | Name |
|-------|------|
| `1` | `Central` |
| `2` | `Parceira` |
| `3` | `Filial` |
