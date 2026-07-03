using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;
using api.Domain.Enums;

namespace api.Domain
{
    public class Empresa
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
        public string Responsavel { get; set; } = string.Empty;

        [JsonPropertyName("empresa_responsavel_id")]
        public Guid ResponsavelId { get; set; }

        [JsonPropertyName("empresa_telefone")]
        public string Telefone { get; set; } = string.Empty;

        [JsonPropertyName("empresa_tipo")]
        public EmpresaTipo Tipo { get; set; }

        public ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();

        [SetsRequiredMembers]
        public Empresa(string nome, string cnpj, string responsavel, Guid responsavelId, string telefone, EmpresaTipo tipo, bool status = true)
        {
            Id = Guid.NewGuid();
            Nome = nome;
            Cnpj = cnpj;
            Status = status;
            Responsavel = responsavel;
            ResponsavelId = responsavelId;
            Telefone = telefone;
            CriadoEm = DateTime.UtcNow;
            Tipo = tipo;
        }
    }
}