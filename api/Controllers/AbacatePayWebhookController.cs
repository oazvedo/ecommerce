using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using api.Application.DTOs.AbacatePay;
using api.Application.Services.Interfaces;
using api.infra;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [ApiController]
    [Route("api/webhook")]
    public class AbacatePayWebhookController(ICarteiraService carteiraService, AbacatePaySettings settings) : ControllerBase
    {
        private readonly ICarteiraService _carteiraService = carteiraService;
        private readonly AbacatePaySettings _settings = settings;

        [HttpPost("abacate-pay")]
        public async Task<IActionResult> HandleWebhook()
        {
            Request.EnableBuffering();
            using var reader = new StreamReader(Request.Body, Encoding.UTF8, leaveOpen: true);
            var rawBody = await reader.ReadToEndAsync();

            if (!string.IsNullOrEmpty(_settings.WebhookSecret))
            {
                var signature = Request.Headers["X-AbacatePay-Signature"].FirstOrDefault();
                if (!VerifyHmac(rawBody, signature))
                    return Unauthorized();
            }

            var payload = JsonSerializer.Deserialize<AbacatePayWebhookPayload>(rawBody);
            if (payload?.Event == "transparent.completed" && !string.IsNullOrEmpty(payload.Data.Id))
                await _carteiraService.ConfirmarRecargaPixAsync(payload.Data.Id);

            return Ok();
        }

        private bool VerifyHmac(string body, string? signature)
        {
            if (string.IsNullOrEmpty(signature)) return false;
            var keyBytes = Encoding.UTF8.GetBytes(_settings.WebhookSecret);
            var bodyBytes = Encoding.UTF8.GetBytes(body);
            var hash = HMACSHA256.HashData(keyBytes, bodyBytes);
            var computed = Convert.ToHexString(hash).ToLower();
            return computed == signature.ToLower();
        }
    }
}
