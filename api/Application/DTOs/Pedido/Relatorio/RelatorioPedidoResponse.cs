
using System.Text.Json.Serialization;

namespace api.Application.DTOs.Pedido.Relatorio
{
    public class RelatorioPedidoResponse
    {
        [JsonPropertyName("produto_mais_vendido")]
        public string ProdutoMaisVendido { get; set; } = string.Empty;
        [JsonPropertyName("total_de_vendas")]
        public int TotalVendas { get; set; }
        [JsonPropertyName("total_de_valor_vendas")]
        public decimal TotalValorVendas { get; set; }
        [JsonPropertyName("maior_valor_de_venda")]
        public decimal MaiorValorDeVenda { get; set; }
        [JsonPropertyName("cliente_mais_frequente")]
        public string ClienteMaisFrequente { get; set; } = string.Empty;
        [JsonPropertyName("tipo_de_contratacao_mais_utilizado")]
        public string TipoDeContratacaoMaisUtilizado { get; set; } = string.Empty;
    }
}