using System.Text.Json.Serialization;
using api.Domain.Enums;

namespace api.Application.DTOs.Empresa
{
    public class CreateEmpresaRequest
    {
        [JsonPropertyName("nome")]
        public string Nome { get; set; } = null!;

        [JsonPropertyName("cnpj")]
        public string Cnpj { get; set; } = null!;


        [JsonPropertyName("telefone")]
        public string Telefone { get; set; } = null!;

        [JsonPropertyName("tipo")]
        public EmpresaTipo Tipo { get; set; }

        [JsonPropertyName("status")]
        public bool Status { get; set; } = true;

        // Opcional: vincula a nova empresa a uma central (só o admin da plataforma
        // pode definir livremente; a central usa o endpoint de filial).
        [JsonPropertyName("empresa_pai_id")]
        public Guid? EmpresaPaiId { get; set; }
    }

    // Onboarding self-service: cliente vira lojista cadastrando a propria loja,
    // sem tipo/status/empresa_pai_id (sempre Central, ativa, independente).
    public class OnboardingLojaRequest
    {
        [JsonPropertyName("nome")]
        public string Nome { get; set; } = null!;

        [JsonPropertyName("cnpj")]
        public string Cnpj { get; set; } = null!;

        [JsonPropertyName("telefone")]
        public string Telefone { get; set; } = null!;
    }

    public class UpdateEmpresaRequest
    {
        [JsonPropertyName("nome")]
        public string Nome { get; set; } = null!;

        [JsonPropertyName("cnpj")]
        public string Cnpj { get; set; } = null!;

        [JsonPropertyName("responsavel")]
        public string Responsavel { get; set; } = null!;

        [JsonPropertyName("responsavel_id")]
        public Guid ResponsavelId { get; set; }

        [JsonPropertyName("telefone")]
        public string Telefone { get; set; } = null!;

        [JsonPropertyName("tipo")]
        public EmpresaTipo Tipo { get; set; }

        [JsonPropertyName("status")]
        public bool Status { get; set; }

        [JsonPropertyName("empresa_pai_id")]
        public Guid? EmpresaPaiId { get; set; }
    }
}
