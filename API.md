# API Documentation

Base URL: `http://localhost:{porta}/api`

All protected endpoints require a Bearer JWT token in the `Authorization` header:

```
Authorization: Bearer {token}
```

Endpoints that return lists are paginated. Pass `?page=1&pageSize=10` as query params. Response shape:

```json
{
  "page": 1,
  "pageSize": 10,
  "totalCount": 42,
  "totalPages": 5,
  "items": [...]
}
```

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
  "token_type": "Bearer"
}
```

**Response `401`** — credentials invalid.

---

## Usuários

### Usuario object

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

No authentication required.

**Query param:** `?cargo=1` (see `UsuarioCargo` enum)

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

### Produto object

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
Policy: `Produto.Create` — `empresa_id` is derived from the authenticated user.

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

### Pedido object

```json
{
  "id": "uuid",
  "status": "Criado",
  "contracacao": "Mensal",
  "valorTotal": 299.70,
  "empresaId": "uuid",
  "empresaNome": "Empresa X",
  "empresaCNPJ": "00.000.000/0001-00",
  "usuarioId": "uuid",
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
  "criadoEm": "2024-01-15T10:00:00Z",
  "atualizadoEm": null
}
```

---

### GET `/pedido/relatorio`
Policy: `Pedido.Read` — returns sales summary for a date range.

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
Policy: `Pedido.Read` — paged, with optional filters.

**Query params:** `?page=1&pageSize=10&status=Criado&contratacao=Mensal&usuarioId=uuid`

**Response `200`** — `PagedResult<Pedido>`.

---

### GET `/pedido/{id}`
Policy: `Pedido.Read`

**Response `200`** — pedido object.  
**Response `404`** `{ "mensagem": "Pedido não encontrado." }`

---

### GET `/pedido/empresa/{empresaId}`
Policy: `Pedido.Read` — paged, returns all pedidos for a specific empresa.

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Pedido>`.

---

### GET `/pedido/empresa/cnpj/{cnpj}`
Policy: `Pedido.Read` — paged, returns all pedidos for an empresa by CNPJ.

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Pedido>`.

---

### GET `/pedido/usuario/{usuarioId}`
Policy: `Pedido.Read` — paged.

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Pedido>`.

---

### GET `/pedido/meus`
Policy: `Pedido.Read` — paged, returns pedidos of the authenticated user (extraído do token).

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Pedido>`.

---

### POST `/pedido`
Policy: `Pedido.Create` — cria o pedido para o usuário autenticado.

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
Policy: `Pedido.UpdateAdmin` — full update (status, contratacao, and items).

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

No authentication required.

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

### Carteira object

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
Policy: `Carteira.Read` — paged.

**Query params:** `?page=1&pageSize=10`

**Response `200`** — `PagedResult<Carteira>`.

---

### GET `/carteira/minha-carteira`
Policy: `Carteira.Read` — returns the carteira of the authenticated user.

**Response `200`** — carteira object.  
**Response `404`**

---

### GET `/carteira/{id}`
Policy: `Carteira.Read`

**Response `200`** — carteira object.  
**Response `404`**

---

### PUT `/carteira/{id}`
Policy: `Carteira.Update` — updates the saldo.

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
Policy: `Carteira.Update` — updates the saldo of the authenticated user's carteira.

**Request** — same shape as `PUT /carteira/{id}`.

**Response `200`** — updated carteira object.  
**Response `404`** `{ "mensagem": "..." }`

---

## Empresa

### Empresa object

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
Policy: `Empresa.Create` — `responsavel` e `responsavel_id` são derivados do usuário autenticado.

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

### Permissao object

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
Policy: `Permissao.Read` — returns all permissions assigned to a user.

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

Enum values are serialized as strings.

### PedidoStatus
| Value | Name |
|-------|------|
| `0` | `Cancelado` — não permite mais atualizações |
| `1` | `Criado` |
| `2` | `EmProcessamento` |
| `4` | `Suporte` |
| `5` | `Finalizado` |

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
