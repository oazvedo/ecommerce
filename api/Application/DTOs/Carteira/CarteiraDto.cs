using System.Text.Json.Serialization;

namespace api.Application.DTOs.Carteira
{
    public class CarteiraDto
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }
   
        [JsonPropertyName("usuario_id")]
        public Guid UsuarioId { get; set; }
        [JsonPropertyName("usuario_nome")]
        public string? UsuarioNome {get;set;}
        [JsonPropertyName("usuario_email")]
        public string? UsuarioEmail {get;set;}

        [JsonPropertyName("saldo")]
        public double Saldo { get; set; } = 0;

        [JsonPropertyName("criado_em")]
        public DateTime CriadoEm {get; set;}

        [JsonPropertyName("atualizado_em")]
        public DateTime? AtualizadoEm {get; set;}

    }
}