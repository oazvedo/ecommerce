using System.Text.Json.Serialization;

namespace api.Application.DTOs.Carteira
{
    public class CarteiraTransacaoDto
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("tipo")]
        public string Tipo { get; set; } = string.Empty;

        [JsonPropertyName("valor")]
        public double Valor { get; set; }

        [JsonPropertyName("descricao")]
        public string? Descricao { get; set; }

        [JsonPropertyName("referencia_id")]
        public Guid? ReferenciaId { get; set; }

        [JsonPropertyName("ocorrido_em")]
        public DateTime OcorridoEm { get; set; }
    }
}
