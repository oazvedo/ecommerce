namespace api.Application.DTOs.Produto
{
    public class ProdutoDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = null!;
        public string Descricao { get; set; } = null!;
        public string Codigo { get; set; } = null!;
        public bool Status { get; set; }
        public decimal Preco { get; set; }
        public DateTime CriadoEm { get; set; }
        public DateTime? AtualizadoEm { get; set; }
        public Guid EmpresaId { get; set; }
        public string? ImagemUrl { get; set; }
        public int Estoque { get; set; }
        public bool FreteGratis { get; set; }
        public string? Variantes { get; set; }
        public string? Categoria { get; set; }
        public double NotaMedia { get; set; }
        public int TotalAvaliacoes { get; set; }
    }
}
