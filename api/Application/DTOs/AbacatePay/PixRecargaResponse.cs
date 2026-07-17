using System.Text.Json.Serialization;

namespace api.Application.DTOs.AbacatePay
{
    public class PixRecargaResponse
    {
        [JsonPropertyName("pix_recarga_id")]
        public Guid PixRecargaId { get; set; }

        [JsonPropertyName("br_code")]
        public string BrCode { get; set; } = string.Empty;

        [JsonPropertyName("br_code_base64")]
        public string BrCodeBase64 { get; set; } = string.Empty;

        [JsonPropertyName("valor")]
        public double Valor { get; set; }

        [JsonPropertyName("criado_em")]
        public DateTime CriadoEm { get; set; }
    }
}
