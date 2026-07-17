using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using api.Application.Services.Interfaces;
using api.infra;

namespace api.Application.Services
{
    public class AbacatePayService : IAbacatePayService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string BaseUrl = "https://api.abacatepay.com/v1";

        public AbacatePayService(HttpClient httpClient, AbacatePaySettings settings)
        {
            _httpClient = httpClient;
            _apiKey = settings.ApiKey;
        }

        public async Task<(string Id, string BrCode, string BrCodeBase64)> CriarPixAsync(double valorEmReais, string descricao)
        {
            var amountCentavos = (int)(valorEmReais * 100);
            var payload = new
            {
                amount = amountCentavos,
                description = descricao,
                expiresIn = 3600
            };

            var json = JsonSerializer.Serialize(payload);

            var request = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/pixQrCode/create");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

            // Content-Type sem charset — igual ao SDK oficial deles
            var contentBytes = Encoding.UTF8.GetBytes(json);
            request.Content = new ByteArrayContent(contentBytes);
            request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");

            var response = await _httpClient.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Erro AbacatePay ({(int)response.StatusCode}): {body}");

            var result = JsonSerializer.Deserialize<PixQrCodeResponse>(body)
                ?? throw new Exception("Resposta inválida do AbacatePay");

            return (result.Data.Id, result.Data.BrCode, result.Data.BrCodeBase64);
        }

        private class PixQrCodeResponse
        {
            [JsonPropertyName("data")]
            public PixQrCodeData Data { get; set; } = new();
        }

        private class PixQrCodeData
        {
            [JsonPropertyName("id")]
            public string Id { get; set; } = string.Empty;

            [JsonPropertyName("brCode")]
            public string BrCode { get; set; } = string.Empty;

            [JsonPropertyName("brCodeBase64")]
            public string BrCodeBase64 { get; set; } = string.Empty;
        }
    }
}
