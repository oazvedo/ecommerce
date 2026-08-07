using System.Text.Json.Serialization;

namespace api.Application.DTOs.AbacatePay
{
    public class AbacatePayWebhookPayload
    {
        [JsonPropertyName("event")]
        public string Event { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public AbacatePayWebhookData Data { get; set; } = new();
    }

    public class AbacatePayWebhookData
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;
    }
}
