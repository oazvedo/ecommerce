using System.Text.Json.Serialization;
using api.Domain.Enums;
using Newtonsoft.Json;

namespace api.Application.DTOs.Pedido
{
    public class PedidoDto
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }

        [JsonProperty("status")]
        public PedidoStatus Status { get; set; }

        [JsonProperty("contratacao")]
        public PedidoTipoContratacaoEnum Contracacao { get; set; }

        [JsonProperty("itens")]
        public List<PedidoItemDto> Itens { get; set; } = new();

        [JsonProperty("valor_total")]
        public decimal ValorTotal { get; set; }

        [JsonProperty("empresa_id")]
        public Guid? EmpresaId { get; set; }

        [JsonProperty("empresa_nome")]
        public string? EmpresaNome { get; set; }

        [JsonProperty("empresa_cnpj")]
        public string? EmpresaCNPJ { get; set; }
        [JsonProperty("usuario_id")]
        public Guid UsuarioId { get; set; }

        [JsonPropertyName("usuario_nome")]
        public string? UsuarioNome {get; set;}

        [JsonProperty("criado_em")]
        public DateTime CriadoEm { get; set; }

        [JsonProperty("atualizado_em")]
        public DateTime? AtualizadoEm { get; set; }
    }
}
