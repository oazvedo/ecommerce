using System.Diagnostics.CodeAnalysis;
using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace api.Domain
{
    public class Produto
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("nome")]
        public required string Nome { get; set; }

        [JsonPropertyName("descricao")]
        public required string Descricao { get; set; }

        [JsonPropertyName("codigo_interno")]
        public required string Codigo { get; set; }

        [JsonPropertyName("status")]
        public bool Status {get; set;}

        [JsonProperty("preco")]
        public decimal Preco { get; set; }

        [JsonPropertyName("criado_em")]
        public DateTime CriadoEm { get; set; }

        [JsonPropertyName("atualizado_em")]
        public DateTime? AtualizadoEm { get; set; }

        [JsonPropertyName("imagem_url")]
        public string? ImagemUrl { get; set; }

        [JsonPropertyName("empresa_id")]
        public Guid EmpresaId { get; set; }

        public int Estoque { get; set; }
        public bool FreteGratis { get; set; }
        public string? Variantes { get; set; }

        [JsonPropertyName("categoria_id")]
        public Guid? CategoriaId { get; set; }

        public Empresa? Empresa { get; set; }
        public CategoriaProduto? CategoriaProduto { get; set; }

        [SetsRequiredMembers]
        public Produto(string nome, string descricao, decimal preco, string codigo, Guid empresaId, bool status = true)
        {
            Id = Guid.NewGuid();
            Nome = nome;
            Descricao = descricao;
            Preco = preco;
            Codigo = codigo;
            EmpresaId = empresaId;
            Status = status;
            CriadoEm = DateTime.UtcNow;
            ValidarProduto();
        }

        public Produto(string nome, string descricao, string codigo, Guid empresaId, bool status)
        {
            Id = Guid.NewGuid();
            Nome = nome;
            Descricao = descricao;
            Codigo = codigo;
            EmpresaId = empresaId;
            Status = status;
            CriadoEm = DateTime.UtcNow;
        }

        public void AtualizarProduto(string nome, string descricao, bool status, string codigo, decimal preco, int estoque, bool freteGratis, string? variantes, Guid? categoriaId)
        {
            Nome = nome;
            Descricao = descricao;
            Status = status;
            Codigo = codigo;
            Preco = preco;
            Estoque = estoque;
            FreteGratis = freteGratis;
            Variantes = variantes;
            CategoriaId = categoriaId;
            AtualizadoEm = DateTime.UtcNow;
            ValidarProduto();
        }

        public void ValidarProduto()
        {
            if (string.IsNullOrWhiteSpace(Nome))
                throw new InvalidOperationException("Nome do produto não pode estar vazio.");
            
            if (string.IsNullOrWhiteSpace(Descricao))
                throw new InvalidOperationException("Descricao do produto não pode estar vazia.");

            if (string.IsNullOrWhiteSpace(Codigo))
                throw new InvalidOperationException("Codigo do produto não pode estar vazio.");

            if (this.Preco <= 0)
                throw new InvalidOperationException("Valor do produto deve ser maior que zero");
        }
    }
}