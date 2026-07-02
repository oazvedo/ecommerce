using System.Text.Json.Serialization;

namespace api.Application.DTOs.Pedido.Relatorio
{
    public class RelatorioPedidoRequest
    {
        [JsonPropertyName("data_inicio")]
        public DateTime DataInicio { get; set; }
        [JsonPropertyName("data_fim")]
        public DateTime DataFim { get; set; }
    }
}