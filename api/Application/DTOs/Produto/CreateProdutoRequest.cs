using System.Text.Json.Serialization;
using api.Domain.Enums;

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

        [JsonPropertyName("categoriaId")]
        public Guid? CategoriaId { get; set; }

        /// <summary>Fisico (bem) ou Servico (assinatura/recorrente).</summary>
        [JsonPropertyName("tipo")]
        public ProdutoTipoEnum Tipo { get; set; } = ProdutoTipoEnum.Fisico;

        /// <summary>Contratacoes que a loja aceita: Mensal, Anual ou Ambas.</summary>
        [JsonPropertyName("contratacaoPermitida")]
        public ProdutoContratacaoPermitidaEnum ContratacaoPermitida { get; set; } = ProdutoContratacaoPermitidaEnum.Ambas;

        /// <summary>Maximo de parcelas aceitas; 0 ou 1 = somente a vista.</summary>
        [JsonPropertyName("maxParcelas")]
        public int MaxParcelas { get; set; } = 1;
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

        [JsonPropertyName("categoriaId")]
        public Guid? CategoriaId { get; set; }

        /// <summary>Fisico (bem) ou Servico (assinatura/recorrente).</summary>
        [JsonPropertyName("tipo")]
        public ProdutoTipoEnum Tipo { get; set; } = ProdutoTipoEnum.Fisico;

        /// <summary>Contratacoes que a loja aceita: Mensal, Anual ou Ambas.</summary>
        [JsonPropertyName("contratacaoPermitida")]
        public ProdutoContratacaoPermitidaEnum ContratacaoPermitida { get; set; } = ProdutoContratacaoPermitidaEnum.Ambas;

        /// <summary>Maximo de parcelas aceitas; 0 ou 1 = somente a vista.</summary>
        [JsonPropertyName("maxParcelas")]
        public int MaxParcelas { get; set; } = 1;
    }
}