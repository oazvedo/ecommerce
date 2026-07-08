using System.Text.Json.Serialization;
using api.Domain.Enums;
using Newtonsoft.Json;

namespace api.Application.DTOs.Pedido
{
    public class CreatePedidoRequest
    {
        [JsonPropertyName("empresa_id")]
        public Guid EmpresaId { get; set; }

        [JsonPropertyName("contratacao")]
        public PedidoTipoContratacaoEnum contratacao {get;set;}

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
