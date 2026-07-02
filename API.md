# API Documentation

Base URL: `http://localhost:{porta}/api`

All protected endpoints require a Bearer JWT token in the `Authorization` header:

```
Authorization: Bearer {token}
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

### GET `/usuario`
Policy: `Usuario.Read`

**Response `200`**
```json
[
  {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@email.com",
    "status": 1,
    "criado_em": "2024-01-15T10:00:00Z",
    "atualizado_em": null
  }
]
```

---

### GET `/usuario/{id}`
Policy: `Usuario.Read`

**Response `200`** — same shape as single item above.  
**Response `404`**

---

### POST `/usuario`
Policy: `Usuario.Create`

**Request**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
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
**Response `404`**

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

### GET `/produto`
Policy: `Produto.Read`

**Response `200`**
```json
[
  {
    "id": "uuid",
    "nome": "Produto A",
    "descricao": "Descrição do produto",
    "codigo": "COD-001",
    "status": true,
    "criado_em": "2024-01-15T10:00:00Z",
    "atualizado_em": null
  }
]
```

---

### GET `/produto/{id}`
Policy: `Produto.Read`

**Response `200`** — same shape as single item above.  
**Response `404`** `{ "mensagem": "Produto não encontrado." }`

---

### POST `/produto`
Policy: `Produto.Create`

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
  "usuario_id": "uuid",
  "usuario_nome": "João Silva",
  "status": 1,
  "contratacao": 1,
  "valor_total": 299.70,
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

### GET `/pedido`
Policy: `Pedido.Read` — returns all pedidos.

**Response `200`** — array of pedido objects.

---

### GET `/pedido/{id}`
Policy: `Pedido.Read`

**Response `200`** — pedido object.  
**Response `404`** `{ "mensagem": "Pedido não encontrado." }`

---

### GET `/pedido/usuario/{usuarioId}`
Policy: `Pedido.Read` — returns all pedidos for a specific user.

**Response `200`** — array of pedido objects.

---

### GET `/pedido/meus`
Policy: `Pedido.Read` — returns pedidos of the authenticated user (extraído do token).

**Response `200`** — array of pedido objects.

---

### POST `/pedido`
Policy: `Pedido.Create` — cria o pedido para o usuário autenticado.

**Request**
```json
{
  "contratacao": 1,
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
  "status": 2,
  "contratacao": 2,
  "itens": [
    {
      "produto_id": "uuid",
      "quantidade": 1
    }
  ]
}
```

**Response `204`**  
**Response `404`** `{ "message": "Pedido não encontrado" }`

---

### PATCH `/pedido/{id}/status`
Policy: `Pedido.Update` — updates only the status.

**Request**
```json
{
  "status": 2
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
  "contratacao": 2
}
```

**Response `200`** — updated pedido object.  
**Response `400`** `{ "mensagem": "Pedidos cancelados não podem ter atualização de status" }`  
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
  "saldo": 150.00,
  "criado_em": "2024-01-15T10:00:00Z",
  "atualizado_em": null
}
```

---

### GET `/carteira`
Policy: `Carteira.Read` — returns all carteiras.

**Response `200`** — array of carteira objects.

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
  "saldo": 200.00
}
```

**Response `200`** — updated carteira object.  
**Response `404`** `{ "message": "Carteira {id} não encontrada" }`

---

## Enums

### PedidoStatus
| Value | Name | Description |
|-------|------|-------------|
| `0` | `Cancelado` | Pedido cancelado — não permite mais atualizações |
| `1` | `Criado` | Estado inicial |
| `2` | `EmProcessamento` | Em processamento |
| `4` | `Suporte` | Aguardando suporte |
| `5` | `Finalizado` | Concluído |

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
