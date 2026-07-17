using System.Text.Json.Serialization;

namespace api.Application.DTOs.AbacatePay
{
    public class PixRecargaRequest
    {
        [JsonPropertyName("valor")]
        public double Valor { get; set; }
    }
}
