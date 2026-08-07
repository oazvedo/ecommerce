using System.Text.Json.Serialization;
using api.Domain.Enums;
using Newtonsoft.Json;

namespace api.Application.DTOs.Pedido
{
    public class CreatePedidoRequest
    {
        // A loja vendedora é derivada de produto.EmpresaId no servidor — não vem do cliente.

        [JsonPropertyName("contratacao")]
        public PedidoTipoContratacaoEnum contratacao {get;set;}

        [JsonPropertyName("forma_pagamento")]
        public FormaPagamentoEnum FormaPagamento { get; set; } = FormaPagamentoEnum.Carteira;

        [JsonPropertyName("parcelas")]
        public int? Parcelas { get; set; }

        [JsonPropertyName("itens")]
        public List<CreatePedidoItemRequest> itens { get; set; } = new();
    }

    public class CreatePedidoItemRequest
    {
        [JsonPropertyName("produto_id")]
        public Guid produtoId { get; set; }

        [JsonPropertyName("quantidade")]
        public int quantidade { get; set; }
    }
}
