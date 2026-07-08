using System.Text.Json.Serialization;
using api.Domain.Enums;

namespace api.Application.DTOs.Empresa
{
    public class EmpresaDto
    {
        [JsonPropertyName("empresa_id")]
        public Guid Id { get; set; }

        [JsonPropertyName("empresa_nome")]
        public string Nome { get; set; } = string.Empty;

        [JsonPropertyName("empresa_cnpj")]
        public string Cnpj { get; set; } = string.Empty;

        [JsonPropertyName("empresa_criado_em")]
        public DateTime CriadoEm { get; set; }

        [JsonPropertyName("empresa_atualizado_em")]
        public DateTime? AtualizadoEm { get; set; }

        [JsonPropertyName("empresa_status")]
        public bool Status { get; set; }

        [JsonPropertyName("empresa_responsavel")]
        public string? Responsavel { get; set; } = string.Empty;

        [JsonPropertyName("empresa_responsavel_id")]
        public Guid ResponsavelId { get; set; }

        [JsonPropertyName("empresa_telefone")]
        public string? Telefone { get; set; } = string.Empty;

        [JsonPropertyName("empresa_tipo")]
        public EmpresaTipo Tipo { get; set; }
    }
}