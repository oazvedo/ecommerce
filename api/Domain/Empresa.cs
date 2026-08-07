using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;
using api.domain;
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

        [JsonPropertyName("empresa_logo_url")]
        public string? LogoUrl { get; set; }

        // Hierarquia (1 nível): empresa-mãe/central. Filial aponta para a central;
        // central tem EmpresaPaiId nulo. A central tem domínio sobre suas filiais.
        [JsonPropertyName("empresa_pai_id")]
        public Guid? EmpresaPaiId { get; set; }

        [JsonIgnore]
        public Empresa? EmpresaPai { get; set; }

        [JsonIgnore]
        public ICollection<Empresa> Filiais { get; set; } = new List<Empresa>();

        public ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();

        public ICollection<Produto> Produtos { get; set; } = new List<Produto>();

        public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();

        [SetsRequiredMembers]
        public Empresa(string nome, string cnpj, string responsavel, Guid responsavelId, string telefone, EmpresaTipo tipo, bool status = true, Guid? empresaPaiId = null)
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
            EmpresaPaiId = empresaPaiId;
        }
    }
}