using System.Text.Json.Serialization;
using api.Domain.Enums;

namespace api.Application.DTOs.Empresa
{
    /// <summary>
    /// Dados públicos de uma loja para a vitrine do marketplace — sem informações
    /// administrativas (CNPJ, responsável, etc.).
    /// </summary>
    public class LojaPublicaDto
    {
        [JsonPropertyName("empresa_id")]
        public Guid Id { get; set; }

        [JsonPropertyName("empresa_nome")]
        public string Nome { get; set; } = string.Empty;

        [JsonPropertyName("empresa_tipo")]
        public EmpresaTipo Tipo { get; set; }

        [JsonPropertyName("empresa_logo_url")]
        public string? LogoUrl { get; set; }
    }
}
