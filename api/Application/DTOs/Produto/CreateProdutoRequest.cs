using System.Text.Json.Serialization;

namespace api.Application.DTOs.Produto
{
    public class CreateProdutoRequest
    {
        [JsonPropertyName("nome")]
        public string Nome { get; set; } = null!;

        [JsonPropertyName("descricao")]
        public string Descricao { get; set; } = null!;

        [JsonPropertyName("preco")]
        public decimal Preco { get; set; }

        [JsonPropertyName("codigo")]
        public string Codigo { get; set; } = null!;

        [JsonPropertyName("status")]
        public bool Status { get; set; }

        [JsonPropertyName("estoque")]
        public int Estoque { get; set; }

        [JsonPropertyName("freteGratis")]
        public bool FreteGratis { get; set; }

        [JsonPropertyName("variantes")]
        public string? Variantes { get; set; }

        [JsonPropertyName("categoria")]
        public string? Categoria { get; set; }
    }

    public class UpdateProdutoRequest
    {
        [JsonPropertyName("nome")]
        public string Nome { get; set; } = null!;

        [JsonPropertyName("descricao")]
        public string Descricao { get; set; } = null!;

        [JsonPropertyName("preco")]
        public decimal Preco { get; set; }

        [JsonPropertyName("codigo")]
        public string Codigo { get; set; } = null!;

        [JsonPropertyName("status")]
        public bool Status { get; set; }

        [JsonPropertyName("estoque")]
        public int Estoque { get; set; }

        [JsonPropertyName("freteGratis")]
        public bool FreteGratis { get; set; }

        [JsonPropertyName("variantes")]
        public string? Variantes { get; set; }

        [JsonPropertyName("categoria")]
        public string? Categoria { get; set; }
    }
}